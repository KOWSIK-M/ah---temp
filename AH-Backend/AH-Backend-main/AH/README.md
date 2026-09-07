# Anjaneya Herbals - Backend API

Spring Boot backend for the Anjaneya Herbals Ayurvedic e-commerce store.

## Tech Stack

- **Framework**: Spring Boot 3.4.1
- **Java**: 21
- **Database**: PostgreSQL with pgvector (local, development, and production)
- **Security**: JWT Authentication
- **Build**: Maven

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+ (or use included wrapper)

### Backend development

```bash
cd AH
./mvnw spring-boot:run
```

App runs on `http://localhost:8888` by default. The local environment uses the
PostgreSQL container described below; it does not use an H2 console.

### Default Admin Account
- Email: `admin@anjaneyaherbals.com`
- Password: `Admin@123`

## Environments

The backend has four intentional environments:

| Profile | Use | AI provider |
|---|---|---|
| `local` (default) | Developer machine | Deterministic RAG with local Ollama `all-minilm` embeddings |
| `dev` | Shared development service | Configurable hosted services |
| `test` | Automated tests | Mocked AI and in-memory database |
| `prod` | Deployed service | Environment-provided hosted services |

### Run locally with lightweight AI

1. Copy `.env.example` to `.env` and set a non-placeholder `JWT_SECRET`.
2. Start the local database and Ollama services, then pull the 46 MB embedding model. The product assistant does not download or use a local chat model.

   ```bash
   docker compose -f compose.local.yml up -d
   docker compose -f compose.local.yml exec ollama ollama pull all-minilm
   ```

   If you previously ran the old 1024-dimension model locally, clear only its local vector index before starting the backend:

   ```bash
   docker compose -f compose.local.yml exec database psql -U anjaneya -d anjaneya_herbals -c "DROP TABLE IF EXISTS vector_store;"
   ```

3. Start the Spring backend with `mvn spring-boot:run`.
4. In `Anjaneya-Herbals`, copy `.env.example` to `.env.local` and run `npm run dev`.

The local frontend calls `http://localhost:8888/api`; the backend uses the local
PostgreSQL and small Ollama embedding container. After the first product import,
use the admin embedding re-index endpoint to build the local catalog vector index.

### Deploy

Set `SPRING_PROFILES_ACTIVE=prod` for the backend and provide all production
secrets through the deployment platform. Set `APP_FRONTEND_URL`,
`APP_OAUTH2_REDIRECT_URI`, and `CORS_ORIGINS` to the exact frontend origin.
For the frontend, set `VITE_API_URL` during the production build to the public
backend API URL, including `/api`. Vite exposes this value at build time, so it
must be present whenever a deployment is rebuilt.

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (supports `categoryId`, `search`, pagination) |
| GET | `/api/products/{id}` | Product details |
| GET | `/api/categories` | List all categories |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |

### Protected (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/{itemId}` | Update cart item quantity |
| DELETE | `/api/cart/{itemId}` | Remove from cart |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Order history |
| GET | `/api/orders/{id}` | Order details |

### Protected (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/{id}` | Update product |
| DELETE | `/api/admin/products/{id}` | Delete product |
| GET | `/api/admin/orders` | All orders |
| PUT | `/api/admin/orders/{id}` | Update order status |

## Production Deployment

### Environment Variables
Copy `.env.example` and configure:

```bash
DATABASE_URL=jdbc:postgresql://host:5432/dbname
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
JWT_SECRET=your-base64-encoded-256bit-secret
CORS_ORIGINS=https://yourdomain.com
APP_FRONTEND_URL=https://yourdomain.com
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

For Razorpay, configure the `payment.captured` and `refund.processed` webhooks
to `https://your-api-domain/api/payment/razorpay/webhook`. The webhook secret
must be set as `RAZORPAY_WEBHOOK_SECRET`. Orders are created from the server's
cart and price calculation; the browser never supplies the payment amount.

## Checkout, returns, and account recovery

- The server calculates delivery, cash-on-delivery, discount, and final totals.
- Online payments are confirmed only after Razorpay signature and payment-record
  verification. Pending online checkouts expire after 30 minutes and restore
  reserved stock.
- Customers can cancel eligible orders and submit a return request. Razorpay
  refunds are reconciled through the payment gateway and its webhook.
- Password-reset links are single-use, stored as hashes, expire after 30 minutes,
  and revoke active refresh-token sessions after a password change.

## Product assistant knowledge boundaries

The Vaidya assistant can use only current catalog records plus the reviewed,
versioned material in `src/main/resources/knowledge/approved.json`. It rejects
unsafe, medical-treatment, prompt-injection, and unrelated requests before
retrieval. It assembles approved source passages and catalog cards
deterministically; it does not generate open-ended model advice. After changing
catalog content or approved knowledge, use the admin embedding re-index endpoint.

### Docker

```bash
docker build -t anjaneya-herbals .
docker run -p 8080:8080 --env-file .env anjaneya-herbals
```

### Platforms
- **Railway**: Connect GitHub repo, set env vars
- **Render**: Deploy as Web Service
- **Fly.io**: Use `flyctl launch`

## Categories (Seeded)
1. Spices
2. Herbal Powders
3. Hair Care
4. Face Care
5. Body Care
6. Dry Fruits

## CORS
Development allows: `http://localhost:5173`, `http://localhost:3000`

Configure `CORS_ORIGINS` for production domains.
