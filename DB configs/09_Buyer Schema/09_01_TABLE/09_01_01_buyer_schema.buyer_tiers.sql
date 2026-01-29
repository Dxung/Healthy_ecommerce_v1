  CREATE TABLE buyer_schema.buyer_tiers (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      code buyer_schema.buyer_tier_code_enum UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      min_spending_6_months DECIMAL(15,2) NOT NULL,
      coin_multiplier DECIMAL(3,2) NOT NULL,
      direct_discount_percent DECIMAL(5,2) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );