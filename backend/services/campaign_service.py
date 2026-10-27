from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models import SaleCampaign
from backend.schemas import CampaignResponse


def map_campaign_to_schema(camp: SaleCampaign) -> CampaignResponse:
    """Explicitly transforms SQLAlchemy SaleCampaign model to camelCase CampaignResponse."""
    product_ids = [p.id for p in camp.products] if camp.products else []
    return CampaignResponse(
        id=camp.id,
        title=camp.title,
        description=camp.description or "",
        bannerImage=camp.banner_image,
        discountBadge=camp.discount_badge,
        startsAt=camp.starts_at.isoformat() if hasattr(camp.starts_at, "isoformat") else str(camp.starts_at),
        endsAt=camp.ends_at.isoformat() if hasattr(camp.ends_at, "isoformat") else str(camp.ends_at),
        status=camp.status,
        productCount=len(product_ids),
        productIds=product_ids,
        totalStockAllocated=camp.total_stock_allocated,
        totalSold=camp.total_sold,
    )


class CampaignService:
    @staticmethod
    def list_campaigns(
        db: Session,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[CampaignResponse]:
        query = db.query(SaleCampaign)
        if status and status.lower() != "all":
            query = query.filter(SaleCampaign.status.ilike(status))

        campaigns = query.order_by(SaleCampaign.starts_at.asc()).offset(offset).limit(limit).all()
        return [map_campaign_to_schema(c) for c in campaigns]

    @staticmethod
    def get_campaign_by_id(db: Session, campaign_id: str) -> Optional[CampaignResponse]:
        camp = db.query(SaleCampaign).filter(SaleCampaign.id == campaign_id).first()
        if not camp:
            return None
        return map_campaign_to_schema(camp)
