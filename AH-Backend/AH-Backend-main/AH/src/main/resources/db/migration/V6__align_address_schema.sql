-- Existing baseline omitted fields required by the current Address entity.
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS address_type VARCHAR(255);
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS email VARCHAR(255);
UPDATE addresses a SET email = u.email FROM users u WHERE a.user_id = u.id AND a.email IS NULL;
