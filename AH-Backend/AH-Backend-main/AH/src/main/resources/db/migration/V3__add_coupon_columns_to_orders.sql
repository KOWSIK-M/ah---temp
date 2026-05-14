-- =============================================================================
-- V3 — Add coupon columns to orders table
-- These columns exist in V1 DDL but V1 was baselined (skipped) on existing
-- deployments, so the live orders table never got them.
-- =============================================================================

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS coupon_code     VARCHAR(50),
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);
