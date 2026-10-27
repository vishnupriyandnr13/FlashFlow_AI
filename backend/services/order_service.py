from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from backend.models import Order
from backend.schemas import OrderResponse, OrderItemResponse, DeliveryAddress


def map_order_to_schema(order: Order) -> OrderResponse:
    """Explicitly transforms SQLAlchemy Order model to camelCase OrderResponse."""
    items_schema = [
        OrderItemResponse(
            productId=item.product_id,
            productName=item.product_name,
            productImage=item.product_image,
            originalPrice=float(item.original_price),
            salePrice=float(item.sale_price),
            quantity=item.quantity,
        )
        for item in order.items
    ]

    addr = None
    if order.delivery_address and isinstance(order.delivery_address, dict):
        addr = DeliveryAddress(
            street=order.delivery_address.get("street", ""),
            city=order.delivery_address.get("city", ""),
            state=order.delivery_address.get("state", ""),
            zipCode=order.delivery_address.get("zipCode", ""),
            country=order.delivery_address.get("country", ""),
        )

    return OrderResponse(
        id=order.id,
        orderNumber=order.order_number,
        customerName=order.customer_name,
        customerEmail=order.customer_email,
        customerPhone=order.customer_phone,
        items=items_schema,
        subtotal=float(order.subtotal),
        shipping=float(order.shipping),
        totalAmount=float(order.total_amount),
        reservationStatus=order.reservation_status,
        paymentStatus=order.payment_status,
        orderStatus=order.order_status,
        createdAt=order.created_at.isoformat() if hasattr(order.created_at, "isoformat") else str(order.created_at),
        deliveryAddress=addr,
    )


class OrderService:
    @staticmethod
    def list_orders(
        db: Session,
        customer_email: Optional[str] = None,
        order_status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[OrderResponse]:
        query = db.query(Order)
        if customer_email:
            query = query.filter(Order.customer_email == customer_email)
        if order_status and order_status.lower() != "all":
            query = query.filter(Order.order_status == order_status)

        orders = query.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()
        return [map_order_to_schema(o) for o in orders]

    @staticmethod
    def get_order_by_id(db: Session, identifier: str) -> Optional[OrderResponse]:
        # Support search by internal ID or human-readable orderNumber (e.g. #FG2024001 or FG2024001)
        clean_id = identifier.strip()
        with_hash = clean_id if clean_id.startswith("#") else f"#{clean_id}"
        without_hash = clean_id[1:] if clean_id.startswith("#") else clean_id

        order = db.query(Order).filter(
            or_(
                Order.id == clean_id,
                Order.order_number == clean_id,
                Order.order_number == with_hash,
                Order.order_number == without_hash,
            )
        ).first()
        if not order:
            return None
        return map_order_to_schema(order)
