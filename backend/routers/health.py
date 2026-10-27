import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database import get_db
from backend.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health(db: Session = Depends(get_db)):
    """Health check endpoint providing runtime and database connectivity diagnostic."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"disconnected ({str(e)})"

    redis_status = "connected"
    try:
        from backend.services.reservation_service import reservation_service
        r = reservation_service.get_redis()
        r.ping()
    except Exception as e:
        redis_status = f"disconnected ({str(e)})"

    is_healthy = db_status == "connected" and redis_status == "connected"
    return HealthResponse(
        status="healthy" if is_healthy else "degraded",
        service="FlashGuard FastAPI Engine",
        version="1.0.0",
        database=db_status,
        redis=redis_status,
        timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )

