import pytest
import datetime
from decimal import Decimal
from sqlalchemy.exc import IntegrityError
from backend.models import Product, SaleCampaign, Order, OrderItem


def test_product_model_constraints(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)

    # Valid product creation
    valid_product = Product(
        id="test-prod-valid",
        name="Test Audio Monitor",
        brand="Acoustics",
        category="Audio",
        sku="TEST-AUD-001",
        original_price=Decimal("4999.00"),
        sale_price=Decimal("3999.00"),
        discount_percentage=20,
        total_stock=10,
        reserved_stock=2,
        available_stock=8,
        sale_starts_at=now,
        sale_ends_at=now + datetime.timedelta(days=1),
        sale_status="live",
    )
    db_session.add(valid_product)
    db_session.commit()

    retrieved = db_session.query(Product).filter(Product.id == "test-prod-valid").first()
    assert retrieved is not None
    assert retrieved.name == "Test Audio Monitor"
    assert retrieved.available_stock == 8


def test_product_invalid_dates_fails(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    # End before start
    invalid_product = Product(
        id="test-prod-invalid-dates",
        name="Invalid Date Prod",
        brand="Generic",
        category="Misc",
        sku="TEST-INVALID-001",
        original_price=Decimal("100.00"),
        sale_price=Decimal("80.00"),
        sale_starts_at=now,
        sale_ends_at=now - datetime.timedelta(days=1),
        sale_status="live",
    )
    db_session.add(invalid_product)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_campaign_product_association(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    prod = db_session.query(Product).filter(Product.id == "prod-1").first()

    campaign = SaleCampaign(
        id="test-camp-assoc",
        title="Association Test Campaign",
        banner_image="http://example.com/banner.jpg",
        starts_at=now,
        ends_at=now + datetime.timedelta(days=2),
        status="Live",
    )
    campaign.products.append(prod)
    db_session.add(campaign)
    db_session.commit()

    saved_camp = db_session.query(SaleCampaign).filter(SaleCampaign.id == "test-camp-assoc").first()
    assert len(saved_camp.products) == 1
    assert saved_camp.products[0].id == "prod-1"


def test_product_negative_stock_fails(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    invalid_stock = Product(
        id="test-prod-neg-stock",
        name="Negative Stock Item",
        brand="Generic",
        category="Misc",
        sku="TEST-NEG-001",
        original_price=Decimal("100.00"),
        sale_price=Decimal("50.00"),
        total_stock=-5,  # Invalid: negative
        reserved_stock=0,
        available_stock=0,
        sale_starts_at=now,
        sale_ends_at=now + datetime.timedelta(days=1),
        sale_status="live",
    )
    db_session.add(invalid_stock)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_product_sale_price_exceeds_original_fails(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    invalid_price = Product(
        id="test-prod-invalid-price",
        name="Price Mismatch Item",
        brand="Generic",
        category="Misc",
        sku="TEST-PRC-001",
        original_price=Decimal("100.00"),
        sale_price=Decimal("150.00"),  # Invalid: sale price exceeds original
        total_stock=10,
        reserved_stock=0,
        available_stock=10,
        sale_starts_at=now,
        sale_ends_at=now + datetime.timedelta(days=1),
        sale_status="live",
    )
    db_session.add(invalid_price)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_order_cascade_delete(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    order = Order(
        id="test-ord-cascade",
        order_number="#FGTEST999",
        customer_name="Cascade Tester",
        customer_email="cascade@example.com",
        subtotal=Decimal("100.00"),
        shipping=Decimal("0.00"),
        total_amount=Decimal("100.00"),
        created_at=now,
    )
    item = OrderItem(
        id="test-item-cascade",
        order_id="test-ord-cascade",
        product_id="prod-1",
        product_name="iPhone 15",
        product_image="http://example.com/img.jpg",
        original_price=Decimal("100.00"),
        sale_price=Decimal("100.00"),
        quantity=1,
    )
    order.items.append(item)
    db_session.add(order)
    db_session.commit()

    # Ensure item exists
    assert db_session.query(OrderItem).filter(OrderItem.id == "test-item-cascade").first() is not None

    # Delete order and verify item is cascaded
    db_session.delete(order)
    db_session.commit()
    assert db_session.query(OrderItem).filter(OrderItem.id == "test-item-cascade").first() is None


def test_seed_database_idempotency(db_session):
    from backend.seed import seed_database
    # Running seed multiple times should be idempotent without primary key violation
    seed_database(db_session)
    seed_database(db_session)
    # Check that product count is consistent
    products = db_session.query(Product).all()
    assert len(products) >= 5
