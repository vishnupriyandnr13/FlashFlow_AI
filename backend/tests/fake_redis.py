"""In-memory Redis test double for FlashGuard.

Simulates Redis strings, hashes, expirations, and the exact atomic Lua script
semantics for stock reservation, confirmation, and release. This allows running
full unit tests in lightweight sandbox environments without a running Redis server.
"""

import time
from typing import Dict, Any, List, Optional


class FakeRedisClient:
    def __init__(self):
        self.strings: Dict[str, str] = {}
        self.hashes: Dict[str, Dict[str, str]] = {}
        self.expirations: Dict[str, float] = {}  # key -> timestamp in seconds
        self.is_connected: bool = True

    def ping(self) -> bool:
        if not self.is_connected:
            raise ConnectionError("Simulated Redis connection failure")
        return True

    def simulate_disconnect(self):
        self.is_connected = False

    def simulate_reconnect(self):
        self.is_connected = True

    def _check_conn(self):
        if not self.is_connected:
            raise ConnectionError("Simulated Redis connection failure")

    def _is_expired(self, key: str) -> bool:
        if key in self.expirations:
            if time.time() > self.expirations[key]:
                self.strings.pop(key, None)
                self.hashes.pop(key, None)
                self.expirations.pop(key, None)
                return True
        return False

    def get(self, key: str) -> Optional[str]:
        self._check_conn()
        if self._is_expired(key):
            return None
        return self.strings.get(key)

    def set(self, key: str, value: Any) -> bool:
        self._check_conn()
        self.strings[key] = str(value)
        return True

    def setnx(self, key: str, value: Any) -> bool:
        self._check_conn()
        if self._is_expired(key) or key not in self.strings:
            self.strings[key] = str(value)
            return True
        return False

    def setex(self, key: str, time_sec: int, value: Any) -> bool:
        self._check_conn()
        self.strings[key] = str(value)
        self.expirations[key] = time.time() + time_sec
        return True

    def exists(self, key: str) -> int:
        self._check_conn()
        if self._is_expired(key):
            return 0
        return 1 if (key in self.strings or key in self.hashes) else 0

    def decrby(self, key: str, amount: int) -> int:
        self._check_conn()
        current = int(self.strings.get(key, "0"))
        new_val = current - amount
        self.strings[key] = str(new_val)
        return new_val

    def incrby(self, key: str, amount: int) -> int:
        self._check_conn()
        current = int(self.strings.get(key, "0"))
        new_val = current + amount
        self.strings[key] = str(new_val)
        return new_val

    def hset(self, key: str, *args, **kwargs) -> int:
        self._check_conn()
        if key not in self.hashes:
            self.hashes[key] = {}

        # Support key, k1, v1, k2, v2... or kwargs or mapping
        if args:
            if len(args) == 1 and isinstance(args[0], dict):
                for k, v in args[0].items():
                    self.hashes[key][str(k)] = str(v)
            else:
                for i in range(0, len(args), 2):
                    if i + 1 < len(args):
                        self.hashes[key][str(args[i])] = str(args[i + 1])

        for k, v in kwargs.items():
            self.hashes[key][str(k)] = str(v)

        return 1

    def hget(self, key: str, field: str) -> Optional[str]:
        self._check_conn()
        if self._is_expired(key):
            return None
        return self.hashes.get(key, {}).get(field)

    def hgetall(self, key: str) -> Dict[str, str]:
        self._check_conn()
        if self._is_expired(key):
            return {}
        return dict(self.hashes.get(key, {}))

    def expire(self, key: str, seconds: int) -> bool:
        self._check_conn()
        self.expirations[key] = time.time() + seconds
        return True

    def ttl(self, key: str) -> int:
        self._check_conn()
        if key in self.expirations:
            remaining = int(self.expirations[key] - time.time())
            return max(0, remaining)
        return -1

    def eval(self, script: str, numkeys: int, *keys_and_args) -> List[Any]:
        """Executes the Lua scripts in-memory with atomic semantics."""
        self._check_conn()
        keys = list(keys_and_args[:numkeys])
        args = list(keys_and_args[numkeys:])

        # 1. RESERVE SCRIPT
        if "LUA_RESERVE_STOCK" in script or "IDEMPOTENT_HIT" in script:
            stock_key = keys[0]
            reserved_key = keys[1]
            res_key = keys[2]
            idemp_key = keys[3] if len(keys) > 3 else ""

            req_qty = int(args[0])
            res_id = args[1]
            prod_id = args[2]
            user_tok = args[3] if len(args) > 3 else ""
            cust_email = args[4] if len(args) > 4 else ""
            created_at = args[5] if len(args) > 5 else ""
            expires_at = args[6] if len(args) > 6 else ""
            ttl_sec = int(args[7]) if len(args) > 7 else 600
            idemp_val = args[8] if len(args) > 8 else ""

            # Check Idempotency key
            if idemp_key and idemp_key in self.strings:
                existing_res_id = self.strings[idemp_key]
                return ["IDEMPOTENT_HIT", existing_res_id]

            if stock_key not in self.strings:
                return ["NOT_INITIALIZED"]

            available = int(self.strings.get(stock_key, "0"))
            if available < req_qty:
                return ["INSUFFICIENT_STOCK", str(available)]

            # Atomic mutation
            self.decrby(stock_key, req_qty)
            self.incrby(reserved_key, req_qty)

            self.hset(
                res_key,
                "reservation_id", res_id,
                "product_id", prod_id,
                "quantity", str(req_qty),
                "user_token", user_tok,
                "customer_email", cust_email,
                "status", "HELD",
                "created_at", created_at,
                "expires_at", expires_at,
                "idempotency_key", idemp_val,
            )
            self.expire(res_key, ttl_sec)

            if idemp_key:
                self.setex(idemp_key, ttl_sec, res_id)

            remaining = available - req_qty
            return ["SUCCESS", str(remaining)]

        # 2. CONFIRM SCRIPT
        elif "LUA_CONFIRM_RESERVATION" in script or "ALREADY_CONFIRMED" in script:
            res_key = keys[0]
            reserved_key = keys[1]

            if not self.exists(res_key):
                return ["NOT_FOUND"]

            curr_status = self.hget(res_key, "status")
            if curr_status == "CONFIRMED":
                return ["ALREADY_CONFIRMED"]
            if curr_status != "HELD":
                return ["INVALID_STATE", curr_status or "UNKNOWN"]

            qty = int(self.hget(res_key, "quantity") or "0")
            self.hset(res_key, "status", "CONFIRMED")
            self.decrby(reserved_key, qty)
            self.expire(res_key, 86400)
            return ["SUCCESS"]

        # 3. RELEASE SCRIPT
        elif "LUA_RELEASE_RESERVATION" in script or "ALREADY_RELEASED" in script:
            stock_key = keys[0]
            reserved_key = keys[1]
            res_key = keys[2]

            if not self.exists(res_key):
                return ["NOT_FOUND"]

            curr_status = self.hget(res_key, "status")
            if curr_status == "RELEASED":
                return ["ALREADY_RELEASED"]
            if curr_status != "HELD":
                return ["INVALID_STATE", curr_status or "UNKNOWN"]

            qty = int(self.hget(res_key, "quantity") or "0")
            self.incrby(stock_key, qty)
            self.decrby(reserved_key, qty)
            self.hset(res_key, "status", "RELEASED")
            self.expire(res_key, 3600)
            return ["SUCCESS", str(qty)]

        return ["UNKNOWN_SCRIPT"]
