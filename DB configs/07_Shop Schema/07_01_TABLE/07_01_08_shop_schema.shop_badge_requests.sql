  CREATE TABLE shop_schema.shop_badge_requests (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      badge_code shop_schema.badge_code_enum NOT NULL,
      status shop_schema.badge_request_status_enum NOT NULL DEFAULT 'pending',
      attribute_check_passed BOOLEAN,
      attribute_check_details JSONB,
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_by UUID REFERENCES users_schema.user_core(id),
      reviewed_at TIMESTAMP,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_shop_badge_requests_shop_id ON shop_schema.shop_badge_requests(shop_id);
  CREATE INDEX idx_shop_badge_requests_status ON shop_schema.shop_badge_requests(status);