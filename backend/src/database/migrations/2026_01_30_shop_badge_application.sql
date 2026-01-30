-- =============================================================================
-- Migration: Shop Badge Application System
-- Date: 2026-01-30
-- Description: Creates tables for badge applications, official brands, and
--              brand document requirements. Also adds expires_at and brand_id
--              to shop_badge_assignments and makes registration_id nullable on shops.
-- =============================================================================

-- =============================================================================
-- STEP 1: Create new enums
-- =============================================================================

-- Badge application type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_application_type_enum') THEN
        CREATE TYPE shop_schema.badge_application_type_enum AS ENUM ('verified', 'official');
    END IF;
END$$;

-- Badge application status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_application_status_enum') THEN
        CREATE TYPE shop_schema.badge_application_status_enum AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
    END IF;
END$$;

-- =============================================================================
-- STEP 2: Modify existing tables
-- =============================================================================

-- Add expires_at column to shop_badge_assignments (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'shop_schema'
        AND table_name = 'shop_badge_assignments'
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE shop_schema.shop_badge_assignments
        ADD COLUMN expires_at TIMESTAMP NULL;
    END IF;
END$$;

-- Add brand_id column to shop_badge_assignments (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'shop_schema'
        AND table_name = 'shop_badge_assignments'
        AND column_name = 'brand_id'
    ) THEN
        ALTER TABLE shop_schema.shop_badge_assignments
        ADD COLUMN brand_id UUID NULL REFERENCES brand_schema.brands(id);

        -- Create index for brand_id
        CREATE INDEX IF NOT EXISTS idx_shop_badge_assignments_brand_id
        ON shop_schema.shop_badge_assignments(brand_id);
    END IF;
END$$;

-- Make registration_id nullable on shops (if not already)
DO $$
BEGIN
    -- Check if column is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'shop_schema'
        AND table_name = 'shops'
        AND column_name = 'registration_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE shop_schema.shops
        ALTER COLUMN registration_id DROP NOT NULL;
    END IF;
END$$;

-- =============================================================================
-- STEP 3: Create new tables
-- =============================================================================

-- Badge Applications table
CREATE TABLE IF NOT EXISTS shop_schema.badge_applications (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shop_schema.shops(id) ON DELETE CASCADE,
    application_type shop_schema.badge_application_type_enum NOT NULL,
    brand_id UUID NULL REFERENCES brand_schema.brands(id),
    status shop_schema.badge_application_status_enum NOT NULL DEFAULT 'pending',
    rejection_reason VARCHAR(500) NULL,
    reviewed_by UUID NULL REFERENCES user_schema.users(id),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for badge_applications
CREATE INDEX IF NOT EXISTS idx_badge_applications_shop_id
ON shop_schema.badge_applications(shop_id);

CREATE INDEX IF NOT EXISTS idx_badge_applications_status
ON shop_schema.badge_applications(status);

CREATE INDEX IF NOT EXISTS idx_badge_applications_type
ON shop_schema.badge_applications(application_type);

CREATE INDEX IF NOT EXISTS idx_badge_applications_brand_id
ON shop_schema.badge_applications(brand_id);

-- Badge Application Documents table
CREATE TABLE IF NOT EXISTS shop_schema.badge_application_documents (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES shop_schema.badge_applications(id) ON DELETE CASCADE,
    document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
    image_url VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for badge_application_documents
CREATE INDEX IF NOT EXISTS idx_badge_app_docs_application_id
ON shop_schema.badge_application_documents(application_id);

-- Shop Official Brands table
CREATE TABLE IF NOT EXISTS shop_schema.shop_official_brands (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shop_schema.shops(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brand_schema.brands(id),
    application_id UUID NULL REFERENCES shop_schema.badge_applications(id),
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    revoked_reason VARCHAR(500) NULL,
    CONSTRAINT uq_shop_official_brand UNIQUE (shop_id, brand_id)
);

-- Indexes for shop_official_brands
CREATE INDEX IF NOT EXISTS idx_shop_official_brands_shop_id
ON shop_schema.shop_official_brands(shop_id);

CREATE INDEX IF NOT EXISTS idx_shop_official_brands_brand_id
ON shop_schema.shop_official_brands(brand_id);

-- Brand Document Requirements table
CREATE TABLE IF NOT EXISTS shop_schema.brand_document_requirements (
    id UUID PRIMARY KEY,
    brand_id UUID NOT NULL REFERENCES brand_schema.brands(id),
    document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_brand_document_requirement UNIQUE (brand_id, document_type_id)
);

-- Indexes for brand_document_requirements
CREATE INDEX IF NOT EXISTS idx_brand_doc_requirements_brand_id
ON shop_schema.brand_document_requirements(brand_id);

-- =============================================================================
-- STEP 4: Create trigger for updated_at on badge_applications
-- =============================================================================

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION shop_schema.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to badge_applications
DROP TRIGGER IF EXISTS set_timestamp_badge_applications ON shop_schema.badge_applications;
CREATE TRIGGER set_timestamp_badge_applications
    BEFORE UPDATE ON shop_schema.badge_applications
    FOR EACH ROW
    EXECUTE FUNCTION shop_schema.trigger_set_timestamp();

-- Apply trigger to brand_document_requirements
DROP TRIGGER IF EXISTS set_timestamp_brand_document_requirements ON shop_schema.brand_document_requirements;
CREATE TRIGGER set_timestamp_brand_document_requirements
    BEFORE UPDATE ON shop_schema.brand_document_requirements
    FOR EACH ROW
    EXECUTE FUNCTION shop_schema.trigger_set_timestamp();

-- =============================================================================
-- STEP 5: Add comments for documentation
-- =============================================================================

COMMENT ON TABLE shop_schema.badge_applications IS 'Stores badge applications submitted by shops for Verified or Official badges';
COMMENT ON COLUMN shop_schema.badge_applications.application_type IS 'Type of badge: verified or official';
COMMENT ON COLUMN shop_schema.badge_applications.brand_id IS 'Brand ID for official applications, NULL for verified';

COMMENT ON TABLE shop_schema.badge_application_documents IS 'Documents submitted with badge applications';
COMMENT ON COLUMN shop_schema.badge_application_documents.expires_at IS 'Expiration date of the document - required for badge applications';

COMMENT ON TABLE shop_schema.shop_official_brands IS 'Tracks which brands a shop is officially authorized to represent';
COMMENT ON COLUMN shop_schema.shop_official_brands.expires_at IS 'Expiration date (earliest expiry from application documents)';

COMMENT ON TABLE shop_schema.brand_document_requirements IS 'Admin-configurable document requirements per brand for Official badge applications';

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
