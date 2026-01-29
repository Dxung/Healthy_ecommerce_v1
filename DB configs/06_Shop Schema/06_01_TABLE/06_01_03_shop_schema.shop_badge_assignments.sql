  CREATE TABLE shop_schema.shop_badge_assignments (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      badge_code shop_schema.badge_code_enum NOT NULL,
      status shop_schema.badge_status_enum NOT NULL DEFAULT 'active',
      granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      disabled_at TIMESTAMP,
      disabled_reason TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_shop_badge UNIQUE(shop_id, badge_code)
  )

  CREATE INDEX idx_shop_badge_assignments_shop_id ON shop_schema.shop_badge_assignments(shop_id);
  CREATE INDEX idx_shop_badge_assignments_status ON shop_schema.shop_badge_assignments(status);