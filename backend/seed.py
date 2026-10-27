import datetime
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine, Base
from backend.models import Product, SaleCampaign, Order, OrderItem


def seed_database(db: Session | None = None):
    """Seed the database with repeatable, realistic electronics products and flash sales."""
    owns_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        owns_session = True

    try:
        now = datetime.datetime.now(datetime.timezone.utc)
        one_day = datetime.timedelta(days=1)
        two_hours = datetime.timedelta(hours=2)

        # -------------------------------------------------------------
        # 1. PRODUCTS
        # -------------------------------------------------------------
        products_data = [
            {
                "id": "prod-1",
                "name": "iPhone 15 (128GB, Blue)",
                "brand": "Apple",
                "category": "Smartphones",
                "description": "Dynamic Island, 48MP main camera, and USB-C in a precision-milled aerospace aluminum enclosure.",
                "sku": "APL-IP15-128-BLU",
                "original_price": 79999.00,
                "sale_price": 64999.00,
                "discount_percentage": 19,
                "total_stock": 50,
                "reserved_stock": 8,
                "available_stock": 42,
                "images": [
                    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
                ],
                "specs": {
                    "Display": "6.1-inch Super Retina XDR OLED",
                    "Chip": "A16 Bionic chip with 5-core GPU",
                    "Storage": "128 GB NVMe",
                    "Battery": "Up to 20 hours video playback",
                    "Port": "USB-C charging and data",
                },
                "features": [
                    "Dynamic Island bubbles up alerts and Live Activities",
                    "New 48MP main camera for super-high-resolution photos",
                    "Color-infused glass and aluminum design with Ceramic Shield front",
                    "Crash Detection can detect a severe car crash and call for help",
                ],
                "rating": 4.8,
                "reviews_count": 1248,
                "max_per_customer": 2,
                "sale_starts_at": now - two_hours,
                "sale_ends_at": now + one_day,
                "sale_status": "live",
                "is_active": True,
            },
            {
                "id": "prod-2",
                "name": "MacBook Air M2 (13.6-inch, 16GB, 512GB)",
                "brand": "Apple",
                "category": "Laptops",
                "description": "Strikingly thin design with lightning-fast M2 chip, 18-hour battery life and Liquid Retina display.",
                "sku": "APL-MBA-M2-512-SLV",
                "original_price": 114999.00,
                "sale_price": 79999.00,
                "discount_percentage": 30,
                "total_stock": 30,
                "reserved_stock": 5,
                "available_stock": 25,
                "images": [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                ],
                "specs": {
                    "Processor": "Apple M2 8-core CPU / 10-core GPU",
                    "Memory": "16GB unified memory",
                    "Storage": "512GB SSD storage",
                    "Display": "13.6-inch Liquid Retina display with True Tone",
                },
                "features": [
                    "Next-generation M2 chip with 100GB/s memory bandwidth",
                    "MagSafe 3 charging port with fast charge support",
                    "Four-speaker sound system with Spatial Audio",
                    "Silent fanless design with zero noise",
                ],
                "rating": 4.9,
                "reviews_count": 892,
                "max_per_customer": 1,
                "sale_starts_at": now - two_hours,
                "sale_ends_at": now + one_day,
                "sale_status": "live",
                "is_active": True,
            },
            {
                "id": "prod-3",
                "name": "Sony WH-1000XM5 Wireless Headphones",
                "brand": "Sony",
                "category": "Audio",
                "description": "Industry-leading noise cancellation optimized by dual processors and 8 microphones.",
                "sku": "SNY-WH1000XM5-BLK",
                "original_price": 29999.00,
                "sale_price": 14999.00,
                "discount_percentage": 50,
                "total_stock": 100,
                "reserved_stock": 12,
                "available_stock": 88,
                "images": [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                ],
                "specs": {
                    "Driver Unit": "30mm precision-engineered carbon fiber",
                    "Battery Life": "Up to 30 hours with ANC turned on",
                    "Connectivity": "Bluetooth 5.2 / Multi-point pairing",
                    "Codec Support": "LDAC, AAC, SBC",
                },
                "features": [
                    "Integrated Processor V1 and HD Noise Cancelling Processor QN1",
                    "Ultra-comfortable lightweight design with soft fit leather",
                    "Speak-to-Chat automatically pauses playback when you start speaking",
                ],
                "rating": 4.7,
                "reviews_count": 2150,
                "max_per_customer": 2,
                "sale_starts_at": now - two_hours,
                "sale_ends_at": now + one_day,
                "sale_status": "live",
                "is_active": True,
            },
            {
                "id": "prod-4",
                "name": "Samsung Galaxy S24 Ultra (512GB, Titanium Gray)",
                "brand": "Samsung",
                "category": "Smartphones",
                "description": "Next-generation Galaxy AI, 200MP camera, built-in S Pen, and titanium frame.",
                "sku": "SAM-GS24U-512-TGR",
                "original_price": 129999.00,
                "sale_price": 89999.00,
                "discount_percentage": 31,
                "total_stock": 40,
                "reserved_stock": 0,
                "available_stock": 40,
                "images": [
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
                ],
                "specs": {
                    "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits",
                    "Processor": "Snapdragon 8 Gen 3 for Galaxy",
                    "Camera": "200MP wide + 50MP periscope + 10MP tele + 12MP ultrawide",
                },
                "features": [
                    "Live Translate for two-way, real-time voice and text translations",
                    "Circle to Search with Google for instant visual discovery",
                    "Corning Gorilla Armor screen reduces reflections significantly",
                ],
                "rating": 4.8,
                "reviews_count": 640,
                "max_per_customer": 2,
                "sale_starts_at": now + one_day,
                "sale_ends_at": now + (one_day * 3),
                "sale_status": "upcoming",
                "is_active": True,
            },
            {
                "id": "prod-5",
                "name": "LG C3 55-inch OLED 4K TV (OLED55C3)",
                "brand": "LG",
                "category": "Televisions",
                "description": "Self-lit OLED pixels with infinite contrast, α9 AI Processor Gen6 and Dolby Vision IQ.",
                "sku": "LG-OLED55C3-4K",
                "original_price": 149999.00,
                "sale_price": 89999.00,
                "discount_percentage": 40,
                "total_stock": 20,
                "reserved_stock": 20,
                "available_stock": 0,
                "images": [
                    "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80",
                ],
                "specs": {
                    "Panel": "55-inch OLED evo 4K Ultra HD",
                    "Refresh Rate": "Native 120Hz with NVIDIA G-Sync & AMD FreeSync",
                    "Audio": "40W 2.2 Channel Dolby Atmos",
                },
                "features": [
                    "Brightness Booster for 20% brighter picture in high ambient light",
                    "webOS 23 with personalized quick cards and voice control",
                ],
                "rating": 4.6,
                "reviews_count": 420,
                "max_per_customer": 1,
                "sale_starts_at": now - (one_day * 4),
                "sale_ends_at": now - (one_day * 2),
                "sale_status": "ended",
                "is_active": True,
            },
        ]

        for p_data in products_data:
            existing = db.query(Product).filter(Product.id == p_data["id"]).first()
            if existing:
                for k, v in p_data.items():
                    setattr(existing, k, v)
            else:
                db.add(Product(**p_data))
        db.flush()

        # -------------------------------------------------------------
        # 2. SALE CAMPAIGNS (Live, Upcoming, Ended)
        # -------------------------------------------------------------
        campaigns_data = [
            {
                "id": "camp-1",
                "title": "Mega Flash Sale",
                "description": "Top brands, unbeatable prices. Engineered with sub-50ms stock allocation.",
                "banner_image": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80",
                "discount_badge": "Up to 70% OFF",
                "starts_at": now - two_hours,
                "ends_at": now + one_day,
                "status": "Live",
                "total_stock_allocated": 180,
                "total_sold": 25,
                "product_ids": ["prod-1", "prod-2", "prod-3"],
            },
            {
                "id": "camp-2",
                "title": "Midnight Tech Drop",
                "description": "Flagship smartphones and next-gen hardware drops at exclusive reservation rates.",
                "banner_image": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
                "discount_badge": "Next Gen Drop",
                "starts_at": now + one_day,
                "ends_at": now + (one_day * 3),
                "status": "Upcoming",
                "total_stock_allocated": 40,
                "total_sold": 0,
                "product_ids": ["prod-4"],
            },
            {
                "id": "camp-3",
                "title": "Home Cinema & OLED Clearance",
                "description": "Premium 4K OLED displays and surround sound packages.",
                "banner_image": "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&auto=format&fit=crop&q=80",
                "discount_badge": "Clearance 40%",
                "starts_at": now - (one_day * 4),
                "ends_at": now - (one_day * 2),
                "status": "Ended",
                "total_stock_allocated": 20,
                "total_sold": 20,
                "product_ids": ["prod-5"],
            },
        ]

        for c_data in campaigns_data:
            p_ids = c_data.pop("product_ids", [])
            existing_c = db.query(SaleCampaign).filter(SaleCampaign.id == c_data["id"]).first()
            if existing_c:
                for k, v in c_data.items():
                    setattr(existing_c, k, v)
                camp_obj = existing_c
            else:
                camp_obj = SaleCampaign(**c_data)
                db.add(camp_obj)
            db.flush()

            # Associate products
            prods = db.query(Product).filter(Product.id.in_(p_ids)).all()
            camp_obj.products = prods

        db.flush()

        # -------------------------------------------------------------
        # 3. SAMPLE ORDERS
        # -------------------------------------------------------------
        orders_data = [
            {
                "id": "ord-1",
                "order_number": "#FG2024001",
                "customer_name": "Arjun Sharma",
                "customer_email": "arjun.sharma@example.com",
                "customer_phone": "+91 98765 43210",
                "subtotal": 64999.00,
                "shipping": 0.00,
                "total_amount": 64999.00,
                "reservation_status": "Held",
                "payment_status": "Paid",
                "order_status": "Processing",
                "idempotency_key": "idemp-seed-001",
                "created_at": now - datetime.timedelta(hours=1),
                "delivery_address": {
                    "street": "14 MG Road, Indiranagar",
                    "city": "Bengaluru",
                    "state": "Karnataka",
                    "zipCode": "560038",
                    "country": "India",
                },
                "items": [
                    {
                        "id": "item-1",
                        "product_id": "prod-1",
                        "product_name": "iPhone 15 (128GB, Blue)",
                        "product_image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
                        "original_price": 79999.00,
                        "sale_price": 64999.00,
                        "quantity": 1,
                    }
                ],
            },
            {
                "id": "ord-2",
                "order_number": "#FG2024002",
                "customer_name": "Priya Patel",
                "customer_email": "priya.patel@example.com",
                "customer_phone": "+91 91234 56789",
                "subtotal": 79999.00,
                "shipping": 0.00,
                "total_amount": 79999.00,
                "reservation_status": "Fulfilled",
                "payment_status": "Paid",
                "order_status": "Completed",
                "idempotency_key": "idemp-seed-002",
                "created_at": now - datetime.timedelta(days=1),
                "delivery_address": {
                    "street": "42 Linking Road, Bandra West",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "zipCode": "400050",
                    "country": "India",
                },
                "items": [
                    {
                        "id": "item-2",
                        "product_id": "prod-2",
                        "product_name": "MacBook Air M2 (13.6-inch, 16GB, 512GB)",
                        "product_image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                        "original_price": 114999.00,
                        "sale_price": 79999.00,
                        "quantity": 1,
                    }
                ],
            },
        ]

        for o_data in orders_data:
            items = o_data.pop("items", [])
            existing_o = db.query(Order).filter(Order.id == o_data["id"]).first()
            if existing_o:
                for k, v in o_data.items():
                    setattr(existing_o, k, v)
                order_obj = existing_o
            else:
                order_obj = Order(**o_data)
                db.add(order_obj)
            db.flush()

            # Clean and re-add items deterministically
            db.query(OrderItem).filter(OrderItem.order_id == order_obj.id).delete()
            for it in items:
                db.add(OrderItem(order_id=order_obj.id, **it))

        db.commit()
        print("✓ Database successfully seeded with products, campaigns, and orders.")
    except Exception as e:
        db.rollback()
        print(f"✗ Database seeding failed: {e}")
        raise
    finally:
        if owns_session:
            db.close()


if __name__ == "__main__":
    seed_database()
