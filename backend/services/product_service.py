from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.models import Product
from backend.schemas import ProductResponse


def map_product_to_schema(prod: Product) -> ProductResponse:
    """Explicitly transforms SQLAlchemy Product model to camelCase ProductResponse."""
    return ProductResponse(
        id=prod.id,
        name=prod.name,
        brand=prod.brand,
        category=prod.category,
        originalPrice=float(prod.original_price),
        salePrice=float(prod.sale_price),
        discountPercentage=prod.discount_percentage,
        totalStock=prod.total_stock,
        reservedStock=prod.reserved_stock,
        availableStock=prod.available_stock,
        images=prod.images or [],
        description=prod.description or "",
        specs=prod.specs or {},
        features=prod.features or [],
        rating=float(prod.rating),
        reviewsCount=prod.reviews_count,
        saleStartsAt=prod.sale_starts_at.isoformat() if hasattr(prod.sale_starts_at, "isoformat") else str(prod.sale_starts_at),
        saleEndsAt=prod.sale_ends_at.isoformat() if hasattr(prod.sale_ends_at, "isoformat") else str(prod.sale_ends_at),
        saleStatus=prod.sale_status,
        maxPerCustomer=prod.max_per_customer,
        sku=prod.sku,
    )


class ProductService:
    @staticmethod
    def list_products(
        db: Session,
        category: Optional[str] = None,
        sale_status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[ProductResponse]:
        query = db.query(Product).filter(Product.is_active == True)

        if category and category.lower() != "all":
            query = query.filter(Product.category.ilike(f"%{category}%"))

        if sale_status and sale_status.lower() != "all":
            query = query.filter(Product.sale_status == sale_status.lower())

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(term),
                    Product.brand.ilike(term),
                    Product.category.ilike(term),
                    Product.description.ilike(term),
                )
            )

        products = query.order_by(Product.created_at.desc()).offset(offset).limit(limit).all()
        return [map_product_to_schema(p) for p in products]

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[ProductResponse]:
        prod = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
        if not prod:
            return None
        return map_product_to_schema(prod)
