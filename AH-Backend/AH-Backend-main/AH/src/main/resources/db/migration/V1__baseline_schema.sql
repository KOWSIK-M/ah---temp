-- =============================================================================
-- V1 — Baseline schema (full DDL for new deployments from scratch)
-- For EXISTING deployments: Flyway's baseline-on-migrate=true marks this as
-- already applied and skips execution, leaving live data untouched.
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(255) NOT NULL,
    last_name   VARCHAR(255) NOT NULL,
    phone       VARCHAR(255),
    role        VARCHAR(50)  NOT NULL DEFAULT 'CUSTOMER',
    created_at  TIMESTAMP,
    updated_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    first_name      VARCHAR(255),
    last_name       VARCHAR(255),
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(255),
    state           VARCHAR(255),
    pincode         VARCHAR(20),
    phone           VARCHAR(20),
    is_default      BOOLEAN DEFAULT FALSE,
    label           VARCHAR(100),
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(512) NOT NULL UNIQUE,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    expiry_date TIMESTAMP NOT NULL,
    created_at  TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    description   TEXT,
    image_url     VARCHAR(512),
    display_order INTEGER,
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP,
    updated_at    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id                BIGSERIAL PRIMARY KEY,
    name              TEXT        NOT NULL,
    description       TEXT,
    short_description TEXT,
    sku               TEXT UNIQUE,
    price             NUMERIC(10,2) NOT NULL,
    old_price         NUMERIC(10,2),
    stock             INTEGER DEFAULT 0,
    weight            DOUBLE PRECISION,
    unit              VARCHAR(255),
    image_url         VARCHAR(512),
    rating            DOUBLE PRECISION DEFAULT 0.0,
    review_count      INTEGER DEFAULT 0,
    on_sale           BOOLEAN DEFAULT FALSE,
    featured          BOOLEAN DEFAULT FALSE,
    ingredients       TEXT,
    benefits          TEXT,
    usage             TEXT,
    category_id       BIGINT REFERENCES categories(id),
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_category_id  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_price        ON products(price);
CREATE INDEX IF NOT EXISTS idx_product_created_at   ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_product_rating       ON products(rating);
CREATE INDEX IF NOT EXISTS idx_product_on_sale      ON products(on_sale);
CREATE INDEX IF NOT EXISTS idx_product_stock        ON products(stock);

CREATE TABLE IF NOT EXISTS product_images (
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  VARCHAR(512)
);

CREATE TABLE IF NOT EXISTS carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT UNIQUE REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         BIGSERIAL PRIMARY KEY,
    cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id                        BIGSERIAL PRIMARY KEY,
    user_id                   BIGINT NOT NULL REFERENCES users(id),
    shipping_address_id       BIGINT REFERENCES addresses(id),
    shipping_address_snapshot TEXT,
    status                    VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount              NUMERIC(10,2) NOT NULL,
    discount_amount           NUMERIC(10,2),
    coupon_code               VARCHAR(50),
    shipping_charges          NUMERIC(10,2),
    tax_amount                NUMERIC(10,2),
    payment_id                VARCHAR(255),
    payment_status            VARCHAR(100),
    payment_method            VARCHAR(100),
    created_at                TIMESTAMP,
    updated_at                TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id          BIGINT NOT NULL REFERENCES products(id),
    product_name        VARCHAR(255) NOT NULL,
    product_image_url   VARCHAR(512),
    quantity            INTEGER NOT NULL,
    price_at_purchase   NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id           BIGINT NOT NULL REFERENCES users(id),
    rating            INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title             TEXT,
    body              TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count     INTEGER DEFAULT 0,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP,
    CONSTRAINT uk_review_product_user UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_product_id  ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_review_user_id     ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_review_created_at  ON reviews(created_at);

CREATE TABLE IF NOT EXISTS coupons (
    id                BIGSERIAL PRIMARY KEY,
    code              VARCHAR(50) NOT NULL UNIQUE,
    description       VARCHAR(255),
    discount_type     VARCHAR(20)   NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE | FIXED
    discount_value    NUMERIC(10,2) NOT NULL,
    min_order_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),   -- cap for percentage coupons
    max_uses          INTEGER,           -- NULL = unlimited
    used_count        INTEGER NOT NULL DEFAULT 0,
    active            BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at        TIMESTAMP,
    created_at        TIMESTAMP,
    updated_at        TIMESTAMP
);
