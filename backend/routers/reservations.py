from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas import (
    ReservationCreateRequest,
    ReservationResponse,
    ReservationConfirmResponse,
    ReservationReleaseResponse,
)
from backend.services.reservation_service import (
    reservation_service,
    InsufficientStockError,
    SaleNotLiveError,
    ReservationNotFoundError,
    ReservationConflictError,
    RedisUnavailableError,
)

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
def create_reservation(
    payload: ReservationCreateRequest,
    db: Session = Depends(get_db),
):
    """Atomically reserve stock for a flash-sale item using Redis Lua script.

    Guarantees:
    - Zero overselling through atomic decrement in memory.
    - Idempotency key prevents double deduction on network retries.
    - Automatic 10-minute hold window before auto-release.
    """
    if payload.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be a positive integer",
        )

    try:
        reservation = reservation_service.create_reservation(
            db=db,
            product_id=payload.productId,
            quantity=payload.quantity,
            user_token=payload.userToken,
            customer_email=payload.customerEmail,
            idempotency_key=payload.idempotencyKey,
        )
        return reservation
    except InsufficientStockError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient inventory available for product '{e.product_id}'. Available: {e.available}, requested: {e.requested}",
        )
    except SaleNotLiveError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product '{e.product_id}' is not currently in 'live' flash-sale state (status: {e.status})",
        )
    except ReservationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except RedisUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inventory locking service (Redis) is currently unavailable: {str(e)}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/{reservation_id}", response_model=ReservationResponse)
def get_reservation(reservation_id: str):
    """Fetch current state of a reservation ticket."""
    try:
        res = reservation_service.get_reservation(reservation_id)
        if not res:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reservation '{reservation_id}' was not found or has expired",
            )
        return res
    except RedisUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inventory locking service (Redis) is currently unavailable: {str(e)}",
        )


@router.post("/{reservation_id}/confirm", response_model=ReservationConfirmResponse)
def confirm_reservation(reservation_id: str):
    """Commit reservation ticket upon payment/order placement signal."""
    try:
        return reservation_service.confirm_reservation(reservation_id)
    except ReservationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reservation '{reservation_id}' was not found or has expired",
        )
    except ReservationConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except RedisUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inventory locking service (Redis) is currently unavailable: {str(e)}",
        )


@router.post("/{reservation_id}/release", response_model=ReservationReleaseResponse)
def release_reservation(reservation_id: str):
    """Release reservation ticket and restore inventory units to available pool."""
    try:
        return reservation_service.release_reservation(reservation_id)
    except ReservationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reservation '{reservation_id}' was not found or has expired",
        )
    except ReservationConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except RedisUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inventory locking service (Redis) is currently unavailable: {str(e)}",
        )


@router.get("/stock/{product_id}")
def get_live_stock_counters(product_id: str):
    """Inspect atomic real-time Redis inventory counters for a product."""
    try:
        return reservation_service.get_stock_level(product_id)
    except RedisUnavailableError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Inventory locking service (Redis) is currently unavailable: {str(e)}",
        )
