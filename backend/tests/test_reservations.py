"""FlashGuard Redis Inventory Reservation Test Suite.

Verifies:
1. Rejection of zero or negative quantities (HTTP 400 / 422).
2. Successful atomic reservation and stock decrement.
3. Last-unit edge condition (reserving unit 1 of 1).
4. Competing requests for depleted stock (HTTP 409 Conflict, no negative stock).
5. Idempotent retries using idempotency key without double-decrementing stock.
6. State lifecycle: HELD -> CONFIRMED, HELD -> RELEASED, idempotency, and invalid transitions.
7. Resilience when Redis is unavailable (HTTP 503 Service Unavailable).
"""

import unittest
import datetime
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.pool import StaticPool
    from backend.database import Base
    from backend.models import Product
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False
    Base = None
    Product = None

from backend.services.reservation_service import (
    ReservationService,
    InsufficientStockError,
    SaleNotLiveError,
    ReservationNotFoundError,
    ReservationConflictError,
    RedisUnavailableError,
)
from backend.tests.fake_redis import FakeRedisClient


class MockProduct:
    def __init__(self, id, available_stock=10, reserved_stock=0, sale_status="live", is_active=True):
        self.id = id
        self.available_stock = available_stock
        self.reserved_stock = reserved_stock
        self.sale_status = sale_status
        self.is_active = is_active


class MockDbQuery:
    def __init__(self, result):
        self._result = result

    def filter(self, *criteria):
        return self

    def first(self):
        return self._result


class MockDbSession:
    def __init__(self, product):
        self.product = product

    def query(self, *entities):
        # Support db.query(Product) and db.query(Product.sale_status)
        if entities and hasattr(entities[0], "key") and entities[0].key == "sale_status":
            return MockDbQuery((self.product.sale_status,))
        # Default or fallback
        if self.product:
            return MockDbQuery(self.product)
        return MockDbQuery(None)

    def close(self):
        pass


class TestRedisReservationService(unittest.TestCase):
    def setUp(self):
        now = datetime.datetime.now(datetime.timezone.utc)
        if HAS_SQLALCHEMY:
            self.engine = create_engine(
                "sqlite:///:memory:",
                connect_args={"check_same_thread": False},
                poolclass=StaticPool,
            )
            Base.metadata.create_all(bind=self.engine)
            self.SessionLocal = sessionmaker(bind=self.engine)
            self.db = self.SessionLocal()

            self.product = Product(
                id="test-prod-101",
                name="Flash Deal Phone",
                brand="FlashTech",
                category="Smartphones",
                sku="SKU-FLASH-101",
                original_price=50000.00,
                sale_price=35000.00,
                discount_percentage=30,
                total_stock=10,
                reserved_stock=0,
                available_stock=10,
                sale_starts_at=now - datetime.timedelta(hours=1),
                sale_ends_at=now + datetime.timedelta(hours=2),
                sale_status="live",
                is_active=True,
            )
            self.db.add(self.product)
            self.db.commit()
        else:
            self.product = MockProduct(
                id="test-prod-101",
                available_stock=10,
                reserved_stock=0,
                sale_status="live",
                is_active=True,
            )
            self.db = MockDbSession(self.product)

        # In-memory Redis test double
        self.fake_redis = FakeRedisClient()
        self.service = ReservationService(redis_client=self.fake_redis)

    def tearDown(self):
        self.db.close()
        if HAS_SQLALCHEMY and hasattr(self, "engine"):
            Base.metadata.drop_all(bind=self.engine)


    def test_zero_or_negative_quantity_rejected(self):
        """Zero or negative quantity must raise ValueError / validation error."""
        with self.assertRaises(ValueError):
            self.service.create_reservation(self.db, self.product.id, quantity=0)

        with self.assertRaises(ValueError):
            self.service.create_reservation(self.db, self.product.id, quantity=-2)

        with self.assertRaises(ValueError):
            self.service.create_reservation(self.db, self.product.id, quantity=15)  # Over max 10

    def test_successful_reservation(self):
        """Reserving 2 units decrements stock from 10 to 8 and creates HELD reservation."""
        res = self.service.create_reservation(
            db=self.db,
            product_id=self.product.id,
            quantity=2,
            customer_email="buyer@test.com",
            idempotency_key="idemp-success-01",
        )

        self.assertIsNotNone(res["reservationId"])
        self.assertEqual(res["productId"], self.product.id)
        self.assertEqual(res["quantity"], 2)
        self.assertEqual(res["status"], "HELD")
        self.assertEqual(res["idempotencyKey"], "idemp-success-01")

        # Verify Redis state
        counters = self.service.get_stock_level(self.product.id)
        self.assertEqual(counters["availableStock"], 8)
        self.assertEqual(counters["reservedStock"], 2)

    def test_last_unit_reservation(self):
        """When available stock is 1, reserving 1 succeeds and reduces available stock to 0."""
        # Set stock in Redis to 1
        self.fake_redis.set(self.service.key_stock(self.product.id), 1)
        self.fake_redis.set(self.service.key_reserved(self.product.id), 9)

        res = self.service.create_reservation(
            db=self.db,
            product_id=self.product.id,
            quantity=1,
            customer_email="last_buyer@test.com",
        )
        self.assertEqual(res["status"], "HELD")
        self.assertEqual(res["quantity"], 1)

        counters = self.service.get_stock_level(self.product.id)
        self.assertEqual(counters["availableStock"], 0)
        self.assertEqual(counters["reservedStock"], 10)

    def test_competing_requests_no_overselling(self):
        """Requests exceeding available stock must be rejected with InsufficientStockError and never cause negative inventory."""
        # Set stock to 1
        self.fake_redis.set(self.service.key_stock(self.product.id), 1)
        self.fake_redis.set(self.service.key_reserved(self.product.id), 9)

        # Buyer 1 reserves the last unit
        res1 = self.service.create_reservation(self.db, self.product.id, quantity=1)
        self.assertEqual(res1["status"], "HELD")

        # Buyer 2 tries to reserve 1 unit -> must fail
        with self.assertRaises(InsufficientStockError) as ctx:
            self.service.create_reservation(self.db, self.product.id, quantity=1)
        self.assertEqual(ctx.exception.available, 0)

        # Confirm stock is exactly 0 and NOT negative
        counters = self.service.get_stock_level(self.product.id)
        self.assertEqual(counters["availableStock"], 0)
        self.assertGreaterEqual(counters["availableStock"], 0)

    def test_idempotent_retries(self):
        """Retrying the same request with the same idempotency key returns identical reservation without extra stock deduction."""
        key = "client-tx-uuid-999"

        # First attempt
        res1 = self.service.create_reservation(
            db=self.db,
            product_id=self.product.id,
            quantity=3,
            customer_email="retry_user@test.com",
            idempotency_key=key,
        )

        # Second attempt (simulating network retry)
        res2 = self.service.create_reservation(
            db=self.db,
            product_id=self.product.id,
            quantity=3,
            customer_email="retry_user@test.com",
            idempotency_key=key,
        )

        self.assertEqual(res1["reservationId"], res2["reservationId"])

        # Stock should only have been decremented by 3 (from 10 to 7)
        counters = self.service.get_stock_level(self.product.id)
        self.assertEqual(counters["availableStock"], 7)
        self.assertEqual(counters["reservedStock"], 3)

    def test_confirm_reservation_lifecycle(self):
        """HELD -> CONFIRMED transition, idempotency, and preventing release after confirm."""
        res = self.service.create_reservation(self.db, self.product.id, quantity=2)
        res_id = res["reservationId"]

        # Confirm reservation
        conf1 = self.service.confirm_reservation(res_id)
        self.assertEqual(conf1["status"], "CONFIRMED")

        # Duplicate confirm is idempotent
        conf2 = self.service.confirm_reservation(res_id)
        self.assertEqual(conf2["status"], "CONFIRMED")

        # Cannot release once confirmed
        with self.assertRaises(ReservationConflictError):
            self.service.release_reservation(res_id)

    def test_release_reservation_lifecycle(self):
        """HELD -> RELEASED restores inventory back to available pool."""
        res = self.service.create_reservation(self.db, self.product.id, quantity=4)
        res_id = res["reservationId"]

        counters_before = self.service.get_stock_level(self.product.id)
        self.assertEqual(counters_before["availableStock"], 6)

        # Release reservation
        rel1 = self.service.release_reservation(res_id)
        self.assertEqual(rel1["status"], "RELEASED")
        self.assertEqual(rel1["restoredQuantity"], 4)

        # Available stock must be restored back to 10
        counters_after = self.service.get_stock_level(self.product.id)
        self.assertEqual(counters_after["availableStock"], 10)
        self.assertEqual(counters_after["reservedStock"], 0)

        # Duplicate release is idempotent
        rel2 = self.service.release_reservation(res_id)
        self.assertEqual(rel2["status"], "RELEASED")

        # Cannot confirm once released
        with self.assertRaises(ReservationConflictError):
            self.service.confirm_reservation(res_id)

    def test_redis_unavailable_handling(self):
        """When Redis connection is lost, RedisUnavailableError is raised."""
        self.fake_redis.simulate_disconnect()
        with self.assertRaises(RedisUnavailableError):
            self.service.create_reservation(self.db, self.product.id, quantity=1)


if __name__ == "__main__":
    unittest.main()
