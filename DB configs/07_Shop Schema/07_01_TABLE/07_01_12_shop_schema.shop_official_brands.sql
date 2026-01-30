CREATE TABLE shop_schema.shop_official_brands (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    shop_id UUID NOT NULL REFERENCES shop_schema.shops(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brand_schema.brands(id),
    application_id UUID NULL,  -- FK added after badge_applications table created
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,  -- Earliest expiry from application documents
    revoked_at TIMESTAMP NULL,
    revoked_reason VARCHAR(500) NULL,
    CONSTRAINT uq_shop_official_brand UNIQUE (shop_id, brand_id)
);

CREATE INDEX idx_shop_official_brands_shop_id ON shop_schema.shop_official_brands(shop_id);
CREATE INDEX idx_shop_official_brands_brand_id ON shop_schema.shop_official_brands(brand_id);

-- FK constraint added after badge_applications table is created:
-- ALTER TABLE shop_schema.shop_official_brands
-- ADD CONSTRAINT fk_shop_official_brands_application
-- FOREIGN KEY (application_id) REFERENCES shop_schema.badge_applications(id);
