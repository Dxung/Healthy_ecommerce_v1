  CREATE TABLE buyer_schema.buyer_tier_status (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      buyer_id UUID UNIQUE NOT NULL REFERENCES users_schema.user_core(id),
      current_tier_code buyer_schema.buyer_tier_code_enum NOT NULL DEFAULT 'bronze',
      spending_6_months DECIMAL(15,2) NOT NULL DEFAULT 0,
      tier_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_buyer_tier_status_buyer_id ON buyer_schema.buyer_tier_status(buyer_id);