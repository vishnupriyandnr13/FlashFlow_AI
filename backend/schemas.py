import datetime
from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator


# ==========================================
# HEALTH SCHEMAS
# ==========================================
class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "FlashGuard FastAPI Engine"
    version: str = "1.0.0"
    database: str = "connected"
    redis: Optional[str] = "disconnected"
    timestamp: str


# ==========================================
# PRODUCT SCHEMAS
# ==========================================
class ProductBase(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    originalPrice: float = Field(..., serialization_alias="originalPrice")
    salePrice: float = Field(..., serialization_alias="salePrice")
    discountPercentage: int = Field(0, serialization_alias="discountPercentage")
    totalStock: int = Field(0, serialization_alias="totalStock")
    reservedStock: int = Field(0, serialization_alias="reservedStock")
    availableStock: int = Field(0, serialization_alias="availableStock")
    images: List[str] = Field(default_factory=list)
    description: str = ""
    specs: Dict[str, str] = Field(default_factory=dict)
    features: List[str] = Field(default_factory=list)
    rating: float = 4.5
    reviewsCount: int = Field(0, serialization_alias="reviewsCount")
    saleStartsAt: str = Field(..., serialization_alias="saleStartsAt")
    saleEndsAt: str = Field(..., serialization_alias="saleEndsAt")
    saleStatus: Literal["upcoming", "live", "ended"] = Field("upcoming", serialization_alias="saleStatus")
    maxPerCustomer: int = Field(2, serialization_alias="maxPerCustomer")
    sku: str

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class ProductResponse(ProductBase):
    pass


# ==========================================
# FLASH SALE / CAMPAIGN SCHEMAS
# ==========================================
class CampaignBase(BaseModel):
    id: str
    title: str
    description: str = ""
    bannerImage: str = Field(..., serialization_alias="bannerImage")
    discountBadge: str = Field("Limited Offer", serialization_alias="discountBadge")
    startsAt: str = Field(..., serialization_alias="startsAt")
    endsAt: str = Field(..., serialization_alias="endsAt")
    status: Literal["Live", "Upcoming", "Scheduled", "Ended"]
    productCount: int = Field(0, serialization_alias="productCount")
    productIds: List[str] = Field(default_factory=list, serialization_alias="productIds")
    totalStockAllocated: int = Field(0, serialization_alias="totalStockAllocated")
    totalSold: int = Field(0, serialization_alias="totalSold")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class CampaignResponse(CampaignBase):
    pass


# ==========================================
# ORDER SCHEMAS
# ==========================================
class OrderItemResponse(BaseModel):
    productId: str = Field(..., serialization_alias="productId")
    productName: str = Field(..., serialization_alias="productName")
    productImage: str = Field(..., serialization_alias="productImage")
    originalPrice: float = Field(..., serialization_alias="originalPrice")
    salePrice: float = Field(..., serialization_alias="salePrice")
    quantity: int

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


class DeliveryAddress(BaseModel):
    street: str
    city: str
    state: str
    zipCode: str
    country: str


class OrderResponse(BaseModel):
    id: str
    orderNumber: str = Field(..., serialization_alias="orderNumber")
    customerName: str = Field(..., serialization_alias="customerName")
    customerEmail: str = Field(..., serialization_alias="customerEmail")
    customerPhone: Optional[str] = Field(None, serialization_alias="customerPhone")
    items: List[OrderItemResponse] = Field(default_factory=list)
    subtotal: float
    shipping: float = 0.0
    totalAmount: float = Field(..., serialization_alias="totalAmount")
    reservationStatus: Literal["Held", "Released", "Fulfilled", "Expired"] = Field("Held", serialization_alias="reservationStatus")
    paymentStatus: Literal["Pending", "Paid", "Failed"] = Field("Pending", serialization_alias="paymentStatus")
    orderStatus: Literal["Processing", "Completed", "Cancelled"] = Field("Processing", serialization_alias="orderStatus")
    createdAt: str = Field(..., serialization_alias="createdAt")
    deliveryAddress: Optional[DeliveryAddress] = Field(None, serialization_alias="deliveryAddress")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
    )


# ==========================================
# RESERVATION SCHEMAS (REDIS ATOMIC LOCKING)
# ==========================================
ReservationStatusType = Literal["HELD", "CONFIRMED", "EXPIRED", "RELEASED"]


class ReservationCreateRequest(BaseModel):
    productId: str = Field(..., alias="productId", description="Unique product ID to reserve stock for")
    quantity: int = Field(1, ge=1, le=10, description="Quantity of items to reserve (must be positive, max 10 per request)")
    userToken: Optional[str] = Field(None, alias="userToken", description="User session token or auth identifier")
    customerEmail: Optional[str] = Field(None, alias="customerEmail", description="Customer email for reservation logging")
    idempotencyKey: Optional[str] = Field(None, alias="idempotencyKey", description="Unique client idempotency key to prevent double reservations")

    model_config = ConfigDict(
        populate_by_name=True,
    )


class ReservationResponse(BaseModel):
    reservationId: str = Field(..., serialization_alias="reservationId")
    productId: str = Field(..., serialization_alias="productId")
    quantity: int
    status: ReservationStatusType
    expiresAt: str = Field(..., serialization_alias="expiresAt")
    ttlSeconds: int = Field(..., serialization_alias="ttlSeconds")
    queuePosition: int = Field(1, serialization_alias="queuePosition")
    token: str
    idempotencyKey: Optional[str] = Field(None, serialization_alias="idempotencyKey")

    model_config = ConfigDict(
        populate_by_name=True,
    )


class ReservationConfirmResponse(BaseModel):
    reservationId: str = Field(..., serialization_alias="reservationId")
    productId: str = Field(..., serialization_alias="productId")
    quantity: int
    status: Literal["CONFIRMED"]
    message: str = "Reservation confirmed upon order placement"

    model_config = ConfigDict(
        populate_by_name=True,
    )


class ReservationReleaseResponse(BaseModel):
    reservationId: str = Field(..., serialization_alias="reservationId")
    productId: str = Field(..., serialization_alias="productId")
    restoredQuantity: int = Field(..., serialization_alias="restoredQuantity")
    status: Literal["RELEASED"]
    message: str = "Reservation released and inventory restored to Redis pool"

    model_config = ConfigDict(
        populate_by_name=True,
    )

