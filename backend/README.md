# FlashGuard FastAPI & Redis Backend

High-concurrency flash sale engine built with Python FastAPI, PostgreSQL, and Redis atomic Lua inventory locking.

## Features
- **API Version 1 (`/api/v1`)**: Products, Campaigns, Orders, Reservations, and Diagnostic Health endpoints matching the FlashGuard React TypeScript frontend client.
- **Atomic Inventory Reservations (Redis Lua)**: Sub-50ms stock reservation with zero overselling guarantee, client idempotency keys, and 10-minute hold windows.
- **PostgreSQL Persistence**: SQLAlchemy 2.0 ORM models with explicit database-level constraints (time windows, decimal prices, non-negative inventory).
- **CORS Configured**: Ready to serve frontend origins (`http://localhost:3000`, `http://127.0.0.1:3000`).
- **Repeatable Seed Script**: Deterministic seed data across Live, Upcoming, and Ended flash sales.
- **Automated Test Suite**: Unit tests with in-memory Redis test double and integration tests with Pytest.

---

## 1. Architecture: Redis & PostgreSQL Dual-Tier Model

FlashGuard decouples high-concurrency peak traffic from durable database writes:

```
                  ┌──────────────────────┐
                  │ React 19 Frontend    │
                  └──────────┬───────────┘
                             │ POST /api/v1/reservations
                             ▼
                  ┌──────────────────────┐
                  │   FastAPI Gateway    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│ Redis In-Memory Layer   │       │ PostgreSQL Database     │
│ - Atomic Lua Scripts    │       │ - System of Record      │
│ - Zero-overselling DECR │       │ - Catalog & Pricing     │
│ - 10-minute TTL Hold    │       │ - Completed Orders      │
│ - Idempotency Keys      │       │ - Durable Reconciliation│
└─────────────────────────┘       └─────────────────────────┘
```

### Zero-Overselling Guarantee via Atomic Lua Scripts
Stock decrement and reservation record creation occur inside a single Redis Lua script (`LUA_RESERVE_STOCK`). Because Redis executes Lua scripts sequentially on its single-threaded event loop:
1. `GET fg:stock:{product_id}` checks if remaining inventory is sufficient.
2. If `available < requested`, the transaction immediately aborts and returns `INSUFFICIENT_STOCK` (HTTP 409). Inventory is **never negative**.
3. If sufficient, `DECRBY fg:stock:{product_id}` and `INCRBY fg:reserved:{product_id}` execute atomically with `HSET fg:reservation:{reservation_id}`.
4. If a client submits a retry with the same `idempotencyKey`, `fg:idempotency:{key}` detects the existing ticket and returns it without deducting stock twice.

### Dual-Write & Reconciliation Semantics
We do **not** claim a distributed 2-phase commit (2PC) between Redis and PostgreSQL:
- **Phase 1 (Ingress)**: Redis serves as the lightning-fast atomic gatekeeper absorbing thousands of requests/sec.
- **Phase 2 (Settlement)**: When customer completes checkout/payment, an `Order` row is created in PostgreSQL and the reservation is marked `CONFIRMED`.
- **Phase 3 (Reconciliation)**: If the reservation hold window lapses (TTL 600s) or the customer cancels, stock is restored via `LUA_RELEASE_RESERVATION`. Periodic background workers reconcile Redis counters against PostgreSQL `Product.available_stock`.

### Redis Key Namespaces
| Key Pattern | Type | Purpose | TTL |
| :--- | :--- | :--- | :--- |
| `fg:stock:{product_id}` | Integer | Current available unreserved inventory | Persistent |
| `fg:reserved:{product_id}` | Integer | Units currently locked in active checkouts | Persistent |
| `fg:reservation:{res_id}` | Hash | Reservation details (`product_id`, `quantity`, `status`, `expires_at`) | 600 seconds |
| `fg:idempotency:{key}` | String | Maps idempotency key to `reservation_id` | 600 seconds |

---

## 2. Environment Requirements
- Python 3.10+
- PostgreSQL 14+ (or Docker)
- Redis 6+ (or Docker)

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

Key variables:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://flashguard:flashguard@localhost:5432/flashguard` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `RESERVATION_TTL_SECONDS` | Hold duration in seconds | `600` (10 minutes) |
| `PORT` | FastAPI server port | `8000` |
| `HOST` | FastAPI host interface | `0.0.0.0` |
| `CORS_ORIGINS` | Permitted client origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `API_V1_PREFIX` | Prefix for version 1 routes | `/api/v1` |

---

## 3. Local Setup & Execution

### Step 1: Create Python Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 2: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Start PostgreSQL & Redis Containers
```bash
# Start PostgreSQL
docker run --name flashguard-pg \
  -e POSTGRES_USER=flashguard \
  -e POSTGRES_PASSWORD=flashguard \
  -e POSTGRES_DB=flashguard \
  -p 5432:5432 -d postgres:16-alpine

# Start Redis
docker run --name flashguard-redis \
  -p 6379:6379 -d redis:7-alpine
```

### Step 4: Seed Initial Data
```bash
python -m backend.seed
```

### Step 5: Start FastAPI Server
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI will be accessible at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health Diagnostic:** `http://localhost:8000/api/v1/health`

---

## 4. Running Automated Tests

### Unit Tests (In-Memory Redis Double)
Execute unit tests without needing an external Redis server:
```bash
python3 -m unittest backend/tests/test_reservations.py -v
```

### Full Pytest Suite (when venv is active)
```bash
pytest backend/tests -v
```

### Live Redis Integration Tests
```bash
pytest backend/tests/test_reservations_integration.py -v
```

---

## 5. API Endpoints

### Health & Diagnostics
- `GET /api/v1/health` - Diagnostic endpoint reporting PostgreSQL and Redis connectivity status.

### Inventory Reservations (Stage 2.4)
- `POST /api/v1/reservations` - Atomically reserve stock for a flash product.
  - Body: `{"productId": "prod-iphone-15", "quantity": 1, "idempotencyKey": "uuid-here"}`
  - Status Codes: `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `503 Service Unavailable`.
- `GET /api/v1/reservations/{id}` - Retrieve reservation ticket and remaining TTL.
- `POST /api/v1/reservations/{id}/confirm` - Confirm reservation upon payment completion.
- `POST /api/v1/reservations/{id}/release` - Release reservation and refund stock back to pool.
- `GET /api/v1/reservations/stock/{productId}` - Inspect real-time atomic inventory counters.

### Catalog & Orders
- `GET /api/v1/products` - List products (filters: `category`, `saleStatus`, `search`, `limit`, `offset`)
- `GET /api/v1/products/{id}` - Single product detail
- `GET /api/v1/campaigns` - List flash sale campaigns
- `GET /api/v1/campaigns/{id}` - Single campaign detail
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/{id}` - Order detail by ID or order number (e.g. `#FG2024001`)
