-- Badge Applications table
-- Stores badge applications submitted by shops for Verified or Official badges
CREATE TABLE shop_schema.badge_applications (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES shop_schema.shops(id) ON DELETE CASCADE,
    application_type shop_schema.badge_application_type_enum NOT NULL,
    brand_id UUID NULL REFERENCES brand_schema.brands(id),  -- Only for 'official' type
    status shop_schema.badge_application_status_enum NOT NULL DEFAULT 'pending',
    rejection_reason VARCHAR(500) NULL,
    reviewed_by UUID NULL REFERENCES users_schema.user_core(id),
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badge_applications_shop_id ON shop_schema.badge_applications(shop_id);
CREATE INDEX idx_badge_applications_status ON shop_schema.badge_applications(status);
CREATE INDEX idx_badge_applications_type ON shop_schema.badge_applications(application_type);
CREATE INDEX idx_badge_applications_brand_id ON shop_schema.badge_applications(brand_id);

-- Trigger for updated_at
CREATE TRIGGER set_timestamp_badge_applications
    BEFORE UPDATE ON shop_schema.badge_applications
    FOR EACH ROW
    EXECUTE FUNCTION shop_schema.trigger_set_timestamp();

COMMENT ON TABLE shop_schema.badge_applications IS 'Stores badge applications submitted by shops for Verified or Official badges';
COMMENT ON COLUMN shop_schema.badge_applications.application_type IS 'Type of badge: verified or official';
COMMENT ON COLUMN shop_schema.badge_applications.brand_id IS 'Brand ID for official applications, NULL for verified';
