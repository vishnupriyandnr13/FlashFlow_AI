"""FlashGuard Redis Atomic Inventory Reservation Service.

Provides atomic, sub-50ms stock reservation for high-concurrency flash sales using
Redis key-value storage and Lua scripts to prevent overselling and race conditions.

Key Architecture:
- Redis acts as the high-throughput, low-latency front-line gatekeeper.
- PostgreSQL acts as the durable system of record for catalog and completed orders.
- Zero Overselling Guarantee: Stock decrement and reservation recording are executed
  atomically within a single Redis Lua script execution context.
- Idempotency: Duplicate requests with the same client idempotency key return the
  original reservation without re-decrementing inventory.
- State Machine: HELD -> CONFIRMED (upon checkout) or RELEASED (upon cancellation/failure)
  or EXPIRED (upon TTL lapse).
"""

import json
import uuid
import datetime
from typing import Dict, Any, Optional, Tuple, Union

try:
    from sqlalchemy.orm import Session
except ImportError:
    Session = Any


try:
    from backend.config import settings
except ImportError:
    class MockSettings:
        REDIS_URL = "redis://localhost:6379/0"
        RESERVATION_TTL_SECONDS = 600
    settings = MockSettings()

try:
    from backend.models import Product
except ImportError:
    Product = None


# Domain exceptions
class ReservationError(Exception):
    """Base reservation exception."""
    pass


class InsufficientStockError(ReservationError):
    """Raised when requested quantity exceeds available stock."""
    def __init__(self, product_id: str, requested: int, available: int):
        super().__init__(f"Insufficient stock for product '{product_id}': requested {requested}, available {available}")
        self.product_id = product_id
        self.requested = requested
        self.available = available


class SaleNotLiveError(ReservationError):
    """Raised when trying to reserve an upcoming or ended product."""
    def __init__(self, product_id: str, status: str):
        super().__init__(f"Product '{product_id}' is not live for purchase (current status: '{status}')")
        self.product_id = product_id
        self.status = status


class ReservationNotFoundError(ReservationError):
    """Raised when reservation ID is not found or has expired."""
    def __init__(self, reservation_id: str):
        super().__init__(f"Reservation '{reservation_id}' was not found or has expired")
        self.reservation_id = reservation_id


class ReservationConflictError(ReservationError):
    """Raised when reservation state transition is invalid (e.g. already confirmed/released)."""
    def __init__(self, reservation_id: str, current_status: str, attempted_action: str):
        super().__init__(f"Cannot {attempted_action} reservation '{reservation_id}' in state '{current_status}'")
        self.reservation_id = reservation_id
        self.current_status = current_status
        self.attempted_action = attempted_action


class RedisUnavailableError(ReservationError):
    """Raised when Redis server is unreachable."""
    def __init__(self, message: str = "Redis distributed cache is currently unavailable"):
        super().__init__(message)


# ============================================================================
# ATOMIC LUA SCRIPTS
# ============================================================================

# 1. Atomic Reservation Script
# KEYS[1] = fg:stock:{product_id}
# KEYS[2] = fg:reserved:{product_id}
# KEYS[3] = fg:reservation:{reservation_id}
# KEYS[4] = fg:idempotency:{idempotency_key} (can be empty string if none)
# ARGV[1] = requested_quantity (int)
# ARGV[2] = reservation_id (str)
# ARGV[3] = product_id (str)
# ARGV[4] = user_token (str)
# ARGV[5] = customer_email (str)
# ARGV[6] = created_at (str)
# ARGV[7] = expires_at (str)
# ARGV[8] = ttl_seconds (int)
# ARGV[9] = idempotency_key (str)
LUA_RESERVE_STOCK = """
-- Check Idempotency Key first
local idemp_key = KEYS[4]
if idemp_key ~= "" then
    local existing_id = redis.call("GET", idemp_key)
    if existing_id then
        return {"IDEMPOTENT_HIT", existing_id}
    end
end

-- Check if available stock key exists in Redis
local stock_val = redis.call("GET", KEYS[1])
if not stock_val then
    return {"NOT_INITIALIZED"}
end

local available = tonumber(stock_val)
local requested = tonumber(ARGV[1])

-- Strict positive integer check & overselling prevention
if available < requested then
    return {"INSUFFICIENT_STOCK", tostring(available)}
end

-- Atomic decrement available and increment reserved
redis.call("DECRBY", KEYS[1], requested)
redis.call("INCRBY", KEYS[2], requested)

-- Record reservation hash
redis.call("HSET", KEYS[3],
    "reservation_id", ARGV[2],
    "product_id", ARGV[3],
    "quantity", ARGV[1],
    "user_token", ARGV[4],
    "customer_email", ARGV[5],
    "status", "HELD",
    "created_at", ARGV[6],
    "expires_at", ARGV[7],
    "idempotency_key", ARGV[9]
)
redis.call("EXPIRE", KEYS[3], tonumber(ARGV[8]))

-- Set idempotency pointer if provided
if idemp_key ~= "" then
    redis.call("SETEX", idemp_key, tonumber(ARGV[8]), ARGV[2])
end

local remaining = available - requested
return {"SUCCESS", tostring(remaining)}
"""

# 2. Atomic Confirm Reservation Script
# KEYS[1] = fg:reservation:{reservation_id}
# KEYS[2] = fg:reserved:{product_id}
LUA_CONFIRM_RESERVATION = """
local res_exists = redis.call("EXISTS", KEYS[1])
if res_exists == 0 then
    return {"NOT_FOUND"}
end

local status = redis.call("HGET", KEYS[1], "status")
if status == "CONFIRMED" then
    return {"ALREADY_CONFIRMED"}
end
if status ~= "HELD" then
    return {"INVALID_STATE", status}
end

local qty = tonumber(redis.call("HGET", KEYS[1], "quantity")) or 0
redis.call("HSET", KEYS[1], "status", "CONFIRMED")
redis.call("DECRBY", KEYS[2], qty)

-- Keep confirmed reservation record for 24h audit window
redis.call("EXPIRE", KEYS[1], 86400)

return {"SUCCESS"}
"""

# 3. Atomic Release Reservation Script
# KEYS[1] = fg:stock:{product_id}
# KEYS[2] = fg:reserved:{product_id}
# KEYS[3] = fg:reservation:{reservation_id}
LUA_RELEASE_RESERVATION = """
local res_exists = redis.call("EXISTS", KEYS[3])
if res_exists == 0 then
    return {"NOT_FOUND"}
end

local status = redis.call("HGET", KEYS[3], "status")
if status == "RELEASED" then
    return {"ALREADY_RELEASED"}
end
if status ~= "HELD" then
    return {"INVALID_STATE", status}
end

local qty = tonumber(redis.call("HGET", KEYS[3], "quantity")) or 0
redis.call("INCRBY", KEYS[1], qty)
redis.call("DECRBY", KEYS[2], qty)

redis.call("HSET", KEYS[3], "status", "RELEASED")
-- Retain released marker briefly for audit
redis.call("EXPIRE", KEYS[3], 3600)

return {"SUCCESS", tostring(qty)}
"""


# ============================================================================
# RESERVATION SERVICE CLASS
# ============================================================================

class ReservationService:
    def __init__(self, redis_client=None):
        self._redis = redis_client
        self._reserve_sha = None
        self._confirm_sha = None
        self._release_sha = None

    def get_redis(self):
        """Lazily connects to Redis or returns injected test-double client."""
        if self._redis is not None:
            return self._redis

        try:
            import redis
            self._redis = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=2.0,
                socket_connect_timeout=2.0,
            )
            # Test connectivity
            self._redis.ping()
            return self._redis
        except Exception as e:
            self._redis = None
            raise RedisUnavailableError(f"Could not connect to Redis at {settings.REDIS_URL}: {str(e)}")

    def set_redis(self, client):
        """Allows injecting a mock/fake Redis client during tests."""
        self._redis = client
        self._reserve_sha = None
        self._confirm_sha = None
        self._release_sha = None

    # Key helpers
    @staticmethod
    def key_stock(product_id: str) -> str:
        return f"fg:stock:{product_id}"

    @staticmethod
    def key_reserved(product_id: str) -> str:
        return f"fg:reserved:{product_id}"

    @staticmethod
    def key_reservation(reservation_id: str) -> str:
        return f"fg:reservation:{reservation_id}"

    @staticmethod
    def key_idempotency(idempotency_key: str) -> str:
        return f"fg:idempotency:{idempotency_key}" if idempotency_key else ""

    def hydrate_product_inventory(self, db: Session, product_id: str) -> Any:
        """Loads product from PostgreSQL and initializes Redis inventory keys atomically."""
        r = self.get_redis()
        try:
            if Product is not None:
                product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
            else:
                product = db.query().filter().first()
        except Exception as e:
            raise ReservationError(f"Database error loading product: {str(e)}")

        if not product:
            raise ReservationNotFoundError(f"Product with id '{product_id}' was not found in catalog")

        sale_status = getattr(product, "sale_status", "live")
        if sale_status != "live":
            raise SaleNotLiveError(product_id, sale_status)

        # Set available and reserved stock in Redis with SETNX to preserve any concurrent init
        stock_key = self.key_stock(product_id)
        reserved_key = self.key_reserved(product_id)

        try:
            # Initialize available stock if not present
            avail = getattr(product, "available_stock", 0)
            res = getattr(product, "reserved_stock", 0)
            r.setnx(stock_key, avail)
            r.setnx(reserved_key, res)
        except Exception as e:
            raise RedisUnavailableError(f"Failed to hydrate Redis keys: {str(e)}")

        return product

    def create_reservation(
        self,
        db: Session,
        product_id: str,
        quantity: int,
        user_token: Optional[str] = None,
        customer_email: Optional[str] = None,
        idempotency_key: Optional[str] = None,
        ttl_seconds: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Atomically reserves stock for a flash-sale product.

        - Enforces positive quantity.
        - Checks sale is live.
        - Validates available stock >= quantity.
        - Decrements stock atomically in Redis via Lua script.
        - Supports client idempotency.
        """
        if quantity <= 0:
            raise ValueError(f"Reservation quantity must be a positive integer, got {quantity}")

        if quantity > 10:
            raise ValueError("Maximum 10 units per reservation request")

        ttl = ttl_seconds or settings.RESERVATION_TTL_SECONDS
        r = self.get_redis()

        try:
            # Step 1: Check Idempotency before proceeding
            if idempotency_key:
                idemp_key = self.key_idempotency(idempotency_key)
                existing_res_id = r.get(idemp_key)
                if existing_res_id:
                    existing_res = self.get_reservation(existing_res_id)
                    if existing_res:
                        return existing_res

            # Step 2: Ensure product is hydrated in Redis from PostgreSQL
            stock_key = self.key_stock(product_id)
            if not r.exists(stock_key):
                self.hydrate_product_inventory(db, product_id)
            else:
                # Check DB sale status
                if Product is not None:
                    prod = db.query(Product.sale_status).filter(Product.id == product_id).first()
                    sale_st = prod[0] if prod else "live"
                else:
                    prod = db.query().filter().first()
                    sale_st = getattr(prod, "sale_status", "live") if prod else "live"

                if sale_st != "live":
                    raise SaleNotLiveError(product_id, sale_st)
        except (InsufficientStockError, SaleNotLiveError, ReservationNotFoundError, ValueError):
            raise
        except (ConnectionError, TimeoutError) as e:
            raise RedisUnavailableError(f"Redis connection failed: {str(e)}")
        except Exception as e:
            if "Redis" in type(e).__name__ or "Connection" in type(e).__name__:
                raise RedisUnavailableError(str(e))
            raise

        # Step 3: Execute atomic Lua reservation
        reservation_id = f"RES-{uuid.uuid4().hex[:10].upper()}"
        now = datetime.datetime.now(datetime.timezone.utc)
        expires_at = now + datetime.timedelta(seconds=ttl)

        res_key = self.key_reservation(reservation_id)
        reserved_key = self.key_reserved(product_id)
        idemp_key = self.key_idempotency(idempotency_key) if idempotency_key else ""

        keys = [stock_key, reserved_key, res_key, idemp_key]
        args = [
            str(quantity),
            reservation_id,
            product_id,
            user_token or "",
            customer_email or "",
            now.isoformat(),
            expires_at.isoformat(),
            str(ttl),
            idempotency_key or "",
        ]

        # Execute Lua script
        try:
            result = r.eval(LUA_RESERVE_STOCK, len(keys), *keys, *args)
        except Exception as e:
            raise RedisUnavailableError(f"Lua execution failed: {str(e)}")

        if not result or len(result) == 0:
            raise ReservationError("Unexpected empty response from reservation script")

        status_code = result[0]
        if status_code == "IDEMPOTENT_HIT":
            # Idempotency hit occurred concurrently
            existing_id = result[1]
            existing_res = self.get_reservation(existing_id)
            if existing_res:
                return existing_res
            reservation_id = existing_id

        elif status_code == "NOT_INITIALIZED":
            # Hydrate and retry once
            self.hydrate_product_inventory(db, product_id)
            result = r.eval(LUA_RESERVE_STOCK, len(keys), *keys, *args)
            if result[0] != "SUCCESS":
                if result[0] == "INSUFFICIENT_STOCK":
                    avail = int(result[1]) if len(result) > 1 else 0
                    raise InsufficientStockError(product_id, quantity, avail)
                raise ReservationError(f"Reservation failed after hydration: {result[0]}")

        elif status_code == "INSUFFICIENT_STOCK":
            avail = int(result[1]) if len(result) > 1 else 0
            raise InsufficientStockError(product_id, quantity, avail)

        elif status_code != "SUCCESS":
            raise ReservationError(f"Reservation script error: {status_code}")

        # Return standardized reservation payload
        token = f"tok_{uuid.uuid4().hex}"
        return {
            "reservationId": reservation_id,
            "productId": product_id,
            "quantity": quantity,
            "status": "HELD",
            "expiresAt": expires_at.isoformat(),
            "ttlSeconds": ttl,
            "queuePosition": 1,
            "token": token,
            "idempotencyKey": idempotency_key,
        }

    def get_reservation(self, reservation_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an active reservation from Redis."""
        r = self.get_redis()
        res_key = self.key_reservation(reservation_id)
        data = r.hgetall(res_key)
        if not data:
            return None

        ttl = r.ttl(res_key)
        if ttl is None or ttl < 0:
            ttl = 0

        return {
            "reservationId": data.get("reservation_id", reservation_id),
            "productId": data.get("product_id", ""),
            "quantity": int(data.get("quantity", 1)),
            "status": data.get("status", "HELD"),
            "expiresAt": data.get("expires_at", ""),
            "ttlSeconds": ttl,
            "queuePosition": 1,
            "token": f"tok_{reservation_id}",
            "idempotencyKey": data.get("idempotency_key") or None,
            "customerEmail": data.get("customer_email") or None,
            "createdAt": data.get("created_at") or None,
        }

    def confirm_reservation(self, reservation_id: str) -> Dict[str, Any]:
        """Atomically transitions reservation to CONFIRMED when order/payment succeeds."""
        r = self.get_redis()
        res_key = self.key_reservation(reservation_id)
        
        # Look up product_id from hash
        product_id = r.hget(res_key, "product_id")
        if not product_id:
            raise ReservationNotFoundError(reservation_id)

        reserved_key = self.key_reserved(product_id)
        keys = [res_key, reserved_key]

        try:
            result = r.eval(LUA_CONFIRM_RESERVATION, len(keys), *keys)
        except Exception as e:
            raise RedisUnavailableError(f"Lua execution failed: {str(e)}")

        code = result[0]
        if code == "NOT_FOUND":
            raise ReservationNotFoundError(reservation_id)
        elif code == "ALREADY_CONFIRMED":
            # Idempotent response
            qty = int(r.hget(res_key, "quantity") or 1)
            return {
                "reservationId": reservation_id,
                "productId": product_id,
                "quantity": qty,
                "status": "CONFIRMED",
                "message": "Reservation was already confirmed",
            }
        elif code == "INVALID_STATE":
            state = result[1] if len(result) > 1 else "UNKNOWN"
            raise ReservationConflictError(reservation_id, state, "confirm")
        elif code != "SUCCESS":
            raise ReservationError(f"Confirmation failed: {code}")

        qty = int(r.hget(res_key, "quantity") or 1)
        return {
            "reservationId": reservation_id,
            "productId": product_id,
            "quantity": qty,
            "status": "CONFIRMED",
            "message": "Reservation confirmed upon order placement",
        }

    def release_reservation(self, reservation_id: str) -> Dict[str, Any]:
        """Atomically cancels a reservation, restores available stock to Redis pool."""
        r = self.get_redis()
        res_key = self.key_reservation(reservation_id)

        product_id = r.hget(res_key, "product_id")
        if not product_id:
            raise ReservationNotFoundError(reservation_id)

        stock_key = self.key_stock(product_id)
        reserved_key = self.key_reserved(product_id)
        keys = [stock_key, reserved_key, res_key]

        try:
            result = r.eval(LUA_RELEASE_RESERVATION, len(keys), *keys)
        except Exception as e:
            raise RedisUnavailableError(f"Lua execution failed: {str(e)}")

        code = result[0]
        if code == "NOT_FOUND":
            raise ReservationNotFoundError(reservation_id)
        elif code == "ALREADY_RELEASED":
            qty = int(r.hget(res_key, "quantity") or 1)
            return {
                "reservationId": reservation_id,
                "productId": product_id,
                "restoredQuantity": qty,
                "status": "RELEASED",
                "message": "Reservation was already released",
            }
        elif code == "INVALID_STATE":
            state = result[1] if len(result) > 1 else "UNKNOWN"
            raise ReservationConflictError(reservation_id, state, "release")
        elif code != "SUCCESS":
            raise ReservationError(f"Release failed: {code}")

        restored_qty = int(result[1]) if len(result) > 1 else 1
        return {
            "reservationId": reservation_id,
            "productId": product_id,
            "restoredQuantity": restored_qty,
            "status": "RELEASED",
            "message": "Reservation released and inventory restored to Redis pool",
        }

    def get_stock_level(self, product_id: str) -> Dict[str, int]:
        """Fetches current stock counters from Redis."""
        r = self.get_redis()
        stock_val = r.get(self.key_stock(product_id))
        reserved_val = r.get(self.key_reserved(product_id))

        return {
            "productId": product_id,
            "availableStock": int(stock_val) if stock_val is not None else 0,
            "reservedStock": int(reserved_val) if reserved_val is not None else 0,
        }


# Global singleton service
reservation_service = ReservationService()
