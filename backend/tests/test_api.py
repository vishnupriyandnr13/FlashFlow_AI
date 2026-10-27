def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "FlashGuard" in data["service"]
    assert data["database"] == "connected"
    assert "timestamp" in data


def test_list_products(client):
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    products = response.json()
    assert isinstance(products, list)
    assert len(products) >= 3

    first = products[0]
    # Check camelCase fields required by TypeScript Product interface
    assert "id" in first
    assert "name" in first
    assert "originalPrice" in first
    assert "salePrice" in first
    assert "discountPercentage" in first
    assert "saleStartsAt" in first
    assert "saleEndsAt" in first
    assert "saleStatus" in first
    assert "availableStock" in first


def test_filter_products_by_category(client):
    response = client.get("/api/v1/products?category=Smartphones")
    assert response.status_code == 200
    products = response.json()
    assert all("Smartphones" in p["category"] for p in products)


def test_search_products(client):
    response = client.get("/api/v1/products?search=MacBook")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 1
    assert "MacBook" in products[0]["name"]


def test_get_product_by_valid_id(client):
    response = client.get("/api/v1/products/prod-1")
    assert response.status_code == 200
    prod = response.json()
    assert prod["id"] == "prod-1"
    assert prod["originalPrice"] == 79999.0
    assert prod["salePrice"] == 64999.0


def test_get_product_by_invalid_id(client):
    response = client.get("/api/v1/products/prod-non-existent-999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()


def test_list_campaigns(client):
    response = client.get("/api/v1/campaigns")
    assert response.status_code == 200
    campaigns = response.json()
    assert isinstance(campaigns, list)
    assert len(campaigns) >= 2

    camp = campaigns[0]
    assert "id" in camp
    assert "title" in camp
    assert "bannerImage" in camp
    assert "startsAt" in camp
    assert "endsAt" in camp
    assert "status" in camp
    assert "productIds" in camp


def test_get_campaign_by_id(client):
    response = client.get("/api/v1/campaigns/camp-1")
    assert response.status_code == 200
    camp = response.json()
    assert camp["id"] == "camp-1"
    assert camp["status"] == "Live"
    assert len(camp["productIds"]) >= 1


def test_get_campaign_by_invalid_id(client):
    response = client.get("/api/v1/campaigns/camp-non-existent")
    assert response.status_code == 404


def test_get_order_by_id_and_order_number(client):
    # Test via internal ID
    res_id = client.get("/api/v1/orders/ord-1")
    assert res_id.status_code == 200
    order = res_id.json()
    assert order["id"] == "ord-1"
    assert order["orderNumber"] == "#FG2024001"
    assert order["reservationStatus"] == "Held"
    assert order["paymentStatus"] == "Paid"
    assert len(order["items"]) == 1

    # Test via encoded order number with hash
    res_num = client.get("/api/v1/orders/%23FG2024001")
    assert res_num.status_code == 200
    assert res_num.json()["id"] == "ord-1"

    # Test via order number without hash
    res_raw = client.get("/api/v1/orders/FG2024001")
    assert res_raw.status_code == 200
    assert res_raw.json()["id"] == "ord-1"


def test_list_orders_filtering(client):
    # Filter by customer email
    res_email = client.get("/api/v1/orders?customerEmail=arjun.sharma@example.com")
    assert res_email.status_code == 200
    orders = res_email.json()
    assert len(orders) >= 1
    assert orders[0]["customerEmail"] == "arjun.sharma@example.com"

    # Filter by order status
    res_status = client.get("/api/v1/orders?status=Processing")
    assert res_status.status_code == 200
    orders = res_status.json()
    assert all(o["orderStatus"] == "Processing" for o in orders)


def test_product_search_case_insensitivity(client):
    # Lowercase search
    res_lower = client.get("/api/v1/products?search=iphone")
    assert res_lower.status_code == 200
    assert any("iPhone" in p["name"] for p in res_lower.json())

    # Uppercase search
    res_upper = client.get("/api/v1/products?search=IPHONE")
    assert res_upper.status_code == 200
    assert any("iPhone" in p["name"] for p in res_upper.json())


def test_product_sale_status_filtering(client):
    res_live = client.get("/api/v1/products?saleStatus=live")
    assert res_live.status_code == 200
    assert all(p["saleStatus"] == "live" for p in res_live.json())


def test_get_order_by_invalid_id(client):
    response = client.get("/api/v1/orders/ord-invalid-999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()
