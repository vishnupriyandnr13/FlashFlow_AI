from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import OrderResponse
from backend.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=List[OrderResponse])
def get_orders(
    customerEmail: Optional[str] = Query(None, alias="customerEmail", description="Filter orders by customer email"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by order status: Processing, Completed, Cancelled"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List orders with optional customer or status filtering."""
    return OrderService.list_orders(
        db=db,
        customer_email=customerEmail,
        order_status=status_filter,
        limit=limit,
        offset=offset,
    )


@router.get("/{order_identifier}", response_model=OrderResponse)
def get_order(order_identifier: str, db: Session = Depends(get_db)):
    """Retrieve an order by internal ID or human-readable orderNumber (e.g. #FG2024001)."""
    order = OrderService.get_order_by_id(db=db, identifier=order_identifier)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_identifier}' was not found",
        )
    return order
