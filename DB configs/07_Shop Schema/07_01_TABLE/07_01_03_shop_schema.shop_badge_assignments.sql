CREATE TABLE shop_schema.shop_badge_assignments (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    shop_id UUID NOT NULL REFERENCES shop_schema.shops(id) ON DELETE CASCADE,
    badge_code shop_schema.badge_code_enum NOT NULL,
    status shop_schema.badge_status_enum NOT NULL DEFAULT 'active',
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    disabled_at TIMESTAMP,
    disabled_reason TEXT,
    expires_at TIMESTAMP NULL,  -- Expiration date for APPROVED/OFFICIAL badges
    brand_id UUID NULL REFERENCES brand_schema.brands(id),  -- Brand ID for OFFICIAL badges
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shop_badge_assignments_shop_id ON shop_schema.shop_badge_assignments(shop_id);
CREATE INDEX idx_shop_badge_assignments_status ON shop_schema.shop_badge_assignments(status);
CREATE INDEX idx_shop_badge_assignments_brand_id ON shop_schema.shop_badge_assignments(brand_id);
