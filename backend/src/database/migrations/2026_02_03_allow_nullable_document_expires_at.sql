-- Allow nullable expires_at for permanent documents
-- This allows documents and badges to have no expiry date (permanent)

-- 1. Allow nullable expires_at in badge_application_documents
ALTER TABLE shop_schema.badge_application_documents
ALTER COLUMN expires_at DROP NOT NULL;

-- 2. Allow nullable expires_at in shop_official_brands
ALTER TABLE shop_schema.shop_official_brands
ALTER COLUMN expires_at DROP NOT NULL;

-- 3. Allow nullable expires_at in shop_badge_assignments (if not already nullable)
ALTER TABLE shop_schema.shop_badge_assignments
ALTER COLUMN expires_at DROP NOT NULL;
