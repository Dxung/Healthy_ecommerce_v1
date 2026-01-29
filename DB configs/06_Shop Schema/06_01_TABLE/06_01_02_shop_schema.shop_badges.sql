CREATE TABLE shop_schema.shop_badges (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      code shop_schema.badge_code_enum UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      platform_fee_discount_percent DECIMAL(5,2),
      search_boost_multiplier DECIMAL(3,2),
      max_product_slots INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
  );