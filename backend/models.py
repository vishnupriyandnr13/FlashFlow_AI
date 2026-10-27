import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    JSON,
    Table,
    Float,
)
from sqlalchemy.orm import relationship
from backend.database import Base


# Many-to-Many association table between Campaigns and Products
campaign_products = Table(
    "campaign_products",
    Base.metadata,
    Column("campaign_id", String(64), ForeignKey("sale_campaigns.id", ondelete="CASCADE"), primary_key=True),
    Column("product_id", String(64), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
)


class Product(Base):
    __tablename__ = "products"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    brand = Column(String(128), nullable=False, index=True)
    category = Column(String(128), nullable=False, index=True)
    description = Column(String(2000), nullable=False, default="")
    sku = Column(String(64), unique=True, nullable=False, index=True)

    # Monetary values using high-precision Decimal/Numeric
    original_price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=False)
    discount_percentage = Column(Integer, nullable=False, default=0)

    # Inventory State
    total_stock = Column(Integer, nullable=False, default=0)
    reserved_stock = Column(Integer, nullable=False, default=0)
    available_stock = Column(Integer, nullable=False, default=0)

    # Product Assets and Specs
    images = Column(JSON, nullable=False, default=list)  # list of image URLs
    specs = Column(JSON, nullable=False, default=dict)   # key-value spec pairs
    features = Column(JSON, nullable=False, default=list) # feature bullets

    # Social Proof & Limits
    rating = Column(Float, nullable=False, default=4.5)
    reviews_count = Column(Integer, nullable=False, default=0)
    max_per_customer = Column(Integer, nullable=False, default=2)

    # Sale Window and Status
    sale_starts_at = Column(DateTime(timezone=True), nullable=False)
    sale_ends_at = Column(DateTime(timezone=True), nullable=False)
    sale_status = Column(String(32), nullable=False, default="upcoming", index=True)  # upcoming, live, ended

    # State & Audit Timestamps
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    campaigns = relationship("SaleCampaign", secondary=campaign_products, back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")

    # Constraints ensuring sound domain logic
    __table_args__ = (
        CheckConstraint("original_price >= 0", name="chk_product_original_price_positive"),
        CheckConstraint("sale_price >= 0", name="chk_product_sale_price_positive"),
        CheckConstraint("sale_price <= original_price", name="chk_product_sale_price_le_original"),
        CheckConstraint("total_stock >= 0", name="chk_product_total_stock_nonnegative"),
        CheckConstraint("reserved_stock >= 0", name="chk_product_reserved_stock_nonnegative"),
        CheckConstraint("available_stock >= 0", name="chk_product_available_stock_nonnegative"),
        CheckConstraint("sale_ends_at > sale_starts_at", name="chk_product_sale_window_valid"),
        CheckConstraint("max_per_customer > 0", name="chk_product_max_per_customer_positive"),
    )


class SaleCampaign(Base):
    __tablename__ = "sale_campaigns"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=False, default="")
    banner_image = Column(String(512), nullable=False)
    discount_badge = Column(String(64), nullable=False, default="Special Offer")

    # Campaign Window
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(32), nullable=False, default="Upcoming", index=True)  # Live, Upcoming, Scheduled, Ended

    # Stock Metrics
    total_stock_allocated = Column(Integer, nullable=False, default=0)
    total_sold = Column(Integer, nullable=False, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    products = relationship("Product", secondary=campaign_products, back_populates="campaigns")

    __table_args__ = (
        CheckConstraint("ends_at > starts_at", name="chk_campaign_time_window_valid"),
        CheckConstraint("total_stock_allocated >= 0", name="chk_campaign_stock_nonnegative"),
        CheckConstraint("total_sold >= 0", name="chk_campaign_sold_nonnegative"),
    )


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, index=True)
    order_number = Column(String(64), unique=True, nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    customer_phone = Column(String(64), nullable=True)

    # Delivery & Billing details (JSON document)
    delivery_address = Column(JSON, nullable=True)

    # Monetary snapshots
    subtotal = Column(Numeric(10, 2), nullable=False)
    shipping = Column(Numeric(10, 2), nullable=False, default=0.00)
    total_amount = Column(Numeric(10, 2), nullable=False)

    # Explicit Workflow & Security States
    reservation_status = Column(String(32), nullable=False, default="Held", index=True)  # Held, Released, Fulfilled, Expired
    payment_status = Column(String(32), nullable=False, default="Pending", index=True)   # Pending, Paid, Failed
    order_status = Column(String(32), nullable=False, default="Processing", index=True)  # Processing, Completed, Cancelled

    # Idempotency token to guard against double-submits
    idempotency_key = Column(String(128), unique=True, nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="chk_order_subtotal_nonnegative"),
        CheckConstraint("shipping >= 0", name="chk_order_shipping_nonnegative"),
        CheckConstraint("total_amount >= 0", name="chk_order_total_amount_nonnegative"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(64), primary_key=True, index=True)
    order_id = Column(String(64), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(String(64), ForeignKey("products.id", ondelete="RESTRICT"), nullable=False, index=True)

    # Snapshot of product info at moment of sale
    product_name = Column(String(255), nullable=False)
    product_image = Column(String(512), nullable=False)
    original_price = Column(Numeric(10, 2), nullable=False)
    sale_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_order_item_quantity_positive"),
        CheckConstraint("original_price >= 0", name="chk_order_item_original_price_positive"),
        CheckConstraint("sale_price >= 0", name="chk_order_item_sale_price_positive"),
    )
