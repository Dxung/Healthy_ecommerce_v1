  CREATE TABLE shop_schema.shops (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      owner_id UUID NOT NULL REFERENCES users_schema.user_core(id),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      logo_url VARCHAR(500),
      cover_url VARCHAR(500),
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address_line VARCHAR(255) NOT NULL,
      ward_id VARCHAR(50) NOT NULL REFERENCES location_schema.wards(id),
      district_id VARCHAR(50) NOT NULL REFERENCES location_schema.districts(id),
      province_id VARCHAR(50) NOT NULL REFERENCES location_schema.provinces(id),
      average_rating DECIMAL(3,2) DEFAULT 0,
      total_ratings INTEGER DEFAULT 0,
      total_products INTEGER DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      order_success_rate DECIMAL(5,2) DEFAULT 0,
      response_time_hours DECIMAL(5,2) DEFAULT 0,
      return_rate DECIMAL(5,2) DEFAULT 0,
      status shop_schema.shop_status_enum NOT NULL DEFAULT 'active',
      is_refund_debt BOOLEAN NOT NULL DEFAULT FALSE,
      is_admin_suspended BOOLEAN NOT NULL DEFAULT FALSE,
      status_reason TEXT,
      status_changed_at TIMESTAMP,
      status_changed_by UUID REFERENCES users_schema.user_core(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
  );

  CREATE INDEX idx_shops_owner_id ON shop_schema.shops(owner_id);
  CREATE INDEX idx_shops_status ON shop_schema.shops(status);
  CREATE INDEX idx_shops_slug ON shop_schema.shops(slug);

  