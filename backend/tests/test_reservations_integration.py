"""Integration tests for Redis reservations requiring a live Redis server.

To run:
1. Start Redis: docker run -p 6379:6379 redis:7-alpine
2. Execute: pytest -m integration backend/tests/test_reservations_integration.py
"""

import os
import unittest
import datetime
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    from backend.database import Base
    from backend.models import Product
    HAS_DEPS = True
except ImportError:
    HAS_DEPS = False

from backend.services.reservation_service import (
    ReservationService,
    InsufficientStockError,
    RedisUnavailableError,
)

# Check if real Redis is available
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")


class TestLiveRedisIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not HAS_DEPS:
            cls.redis_available = False
            return

        try:
            import redis
            cls.client = redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=1.0)
            cls.client.ping()
            cls.redis_available = True
        except Exception:
            cls.redis_available = False


    def setUp(self):
        if not self.redis_available:
            self.skipTest("Live Redis server not reachable at " + REDIS_URL)

        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.db = self.SessionLocal()

        now = datetime.datetime.now(datetime.timezone.utc)
        self.product = Product(
            id="live-redis-prod-1",
            name="Live Redis Test Phone",
            brand="FlashLive",
            category="Smartphones",
            sku="SKU-LIVE-01",
            original_price=1000.0,
            sale_price=800.0,
            discount_percentage=20,
            total_stock=5,
            reserved_stock=0,
            available_stock=5,
            sale_starts_at=now - datetime.timedelta(minutes=30),
            sale_ends_at=now + datetime.timedelta(hours=1),
            sale_status="live",
            is_active=True,
        )
        self.db.add(self.product)
        self.db.commit()

        self.service = ReservationService(redis_client=self.client)
        # Clean test keys
        self.client.delete(
            self.service.key_stock(self.product.id),
            self.service.key_reserved(self.product.id),
        )

    def tearDown(self):
        if hasattr(self, "client") and self.redis_available:
            self.client.delete(
                self.service.key_stock(self.product.id),
                self.service.key_reserved(self.product.id),
            )
        if hasattr(self, "db"):
            self.db.close()

    def test_live_atomic_reservation(self):
        """Exercises real Redis server with Lua script atomic execution."""
        res = self.service.create_reservation(self.db, self.product.id, quantity=2)
        self.assertEqual(res["status"], "HELD")
        self.assertEqual(res["quantity"], 2)

        stock = self.service.get_stock_level(self.product.id)
        self.assertEqual(stock["availableStock"], 3)
        self.assertEqual(stock["reservedStock"], 2)

        # Confirm
        conf = self.service.confirm_reservation(res["reservationId"])
        self.assertEqual(conf["status"], "CONFIRMED")


if __name__ == "__main__":
    unittest.main()
