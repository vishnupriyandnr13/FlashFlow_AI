from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import CampaignResponse
from backend.services.campaign_service import CampaignService

router = APIRouter(prefix="/campaigns", tags=["Flash Campaigns"])


@router.get("", response_model=List[CampaignResponse])
def get_campaigns(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: Live, Upcoming, Scheduled, Ended"),
    limit: int = Query(50, ge=1, le=100, description="Max campaigns to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
):
    """List flash sale campaigns."""
    return CampaignService.list_campaigns(
        db=db,
        status=status_filter,
        limit=limit,
        offset=offset,
    )


@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Retrieve details of a specific flash campaign by ID."""
    campaign = CampaignService.get_campaign_by_id(db=db, campaign_id=campaign_id)
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flash sale campaign with id '{campaign_id}' was not found",
        )
    return campaign
