from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import ProductResponse
from backend.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None, description="Filter products by category name"),
    saleStatus: Optional[str] = Query(None, alias="saleStatus", description="Filter by sale status: upcoming, live, or ended"),
    search: Optional[str] = Query(None, description="Search keyword across name, brand, and description"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Session = Depends(get_db),
):
    """Retrieve catalog products with optional category, status, and search filters."""
    return ProductService.list_products(
        db=db,
        category=category,
        sale_status=saleStatus,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Retrieve a single product by unique ID."""
    product = ProductService.get_product_by_id(db=db, product_id=product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id '{product_id}' was not found in catalog",
        )
    return product
