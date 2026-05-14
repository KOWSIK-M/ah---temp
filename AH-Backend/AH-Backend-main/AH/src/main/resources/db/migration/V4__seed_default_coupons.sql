-- Default / test coupons seeded on first migration run.
-- INSERT ... ON CONFLICT DO NOTHING keeps this idempotent so re-running
-- migrations (e.g. on a fresh DB) never fails.

INSERT INTO coupons (code, description, discount_type, discount_value,
                     min_order_amount, max_discount_amount, max_uses,
                     used_count, active, expires_at, created_at, updated_at)
VALUES
  -- 10% off any order, no cap, no expiry – great for general testing
  ('WELCOME10',
   'Welcome offer — 10% off your first order',
   'PERCENTAGE', 10.00,
   0.00, NULL, NULL,
   0, TRUE, NULL, NOW(), NOW()),

  -- 20% off orders ≥ ₹500, capped at ₹150
  ('HERBAL20',
   '20% off on orders above ₹500 (max ₹150)',
   'PERCENTAGE', 20.00,
   500.00, 150.00, NULL,
   0, TRUE, NULL, NOW(), NOW()),

  -- Flat ₹100 off orders ≥ ₹300
  ('FLAT100',
   'Flat ₹100 off on orders above ₹300',
   'FIXED', 100.00,
   300.00, NULL, NULL,
   0, TRUE, NULL, NOW(), NOW()),

  -- 50% off, limited to 5 uses (good for testing exhaustion logic)
  ('TESTMAX',
   'Test coupon — 50% off, limited to 5 uses',
   'PERCENTAGE', 50.00,
   0.00, 500.00, 5,
   0, TRUE, NULL, NOW(), NOW()),

  -- Already expired (tests expiry display in admin)
  ('EXPIRED',
   'Expired test coupon',
   'PERCENTAGE', 15.00,
   0.00, NULL, NULL,
   0, TRUE, '2024-01-01 00:00:00', NOW(), NOW()),

  -- Inactive coupon (tests inactive display in admin)
  ('DISABLED',
   'Inactive test coupon',
   'FIXED', 200.00,
   0.00, NULL, NULL,
   0, FALSE, NULL, NOW(), NOW())

ON CONFLICT (code) DO NOTHING;
