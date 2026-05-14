-- =============================================================================
-- V2 — Add coupons table
-- V1 was baselined on existing deployments (skipped), so this migration
-- creates the coupons table that Hibernate now validates against.
-- =============================================================================

CREATE TABLE IF NOT EXISTS coupons (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(50)   NOT NULL UNIQUE,
    description         VARCHAR(255),
    discount_type       VARCHAR(20)   NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE | FIXED
    discount_value      NUMERIC(10,2) NOT NULL,
    min_order_amount    NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_discount_amount NUMERIC(10,2),   -- cap for PERCENTAGE coupons; NULL = no cap
    max_uses            INTEGER,         -- NULL = unlimited
    used_count          INTEGER NOT NULL DEFAULT 0,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at          TIMESTAMP,
    created_at          TIMESTAMP,
    updated_at          TIMESTAMP
);
