# Anjaneya Herbals - Backend API

Spring Boot backend for the Anjaneya Herbals Ayurvedic e-commerce store.

## Tech Stack

- **Framework**: Spring Boot 3.4.1
- **Java**: 21
- **Database**: PostgreSQL (prod) / H2 (dev)
- **Security**: JWT Authentication
- **Build**: Maven

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+ (or use included wrapper)

### Development Mode

```bash
cd AH
./mvnw spring-boot:run
```

App runs on `http://localhost:8080` with H2 in-memory database.

**H2 Console**: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:anjaneyadb`
- Username: `sa`
- Password: (empty)

### Default Admin Account
- Email: `admin@anjaneyaherbals.com`
- Password: `Admin@123`

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
```

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
