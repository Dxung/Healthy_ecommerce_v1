CREATE TABLE shop_schema.shop_registration_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users_schema.user_core(id),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      logo_url VARCHAR(500),
      cover_url VARCHAR(500),
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address_line VARCHAR(255) NOT NULL,
      ward_id VARCHAR(50) NOT NULL REFERENCES location_schema.wards(id),
      district_id VARCHAR(50) NOT NULL REFERENCES location_schema.districts(id),
      province_id VARCHAR(50) NOT NULL REFERENCES location_schema.provinces(id),
      requested_brand_id UUID REFERENCES brand_schema.brands(id),
      status shop_schema.shop_registration_status_enum NOT NULL DEFAULT 'pending',
      rejection_reason VARCHAR(500),
      reviewed_by UUID REFERENCES users_schema.user_core(id),
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_shop_reg_user_id ON shop_schema.shop_registration_requests(user_id);
  CREATE INDEX idx_shop_reg_status ON shop_schema.shop_registration_requests(status);
  CREATE UNIQUE INDEX idx_shop_reg_user_pending ON shop_schema.shop_registration_requests(user_id) WHERE status = 'pending';