  CREATE TABLE penalty_schema.shop_penalty_status (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID UNIQUE NOT NULL REFERENCES shop_schema.shops(id),
      current_points INTEGER NOT NULL DEFAULT 0,
      current_tier_level SMALLINT NOT NULL DEFAULT 0,
      first_violation_at TIMESTAMP,
      tier_started_at TIMESTAMP,
      is_frozen BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_shop_penalty_shop_id ON penalty_schema.shop_penalty_status(shop_id);
  CREATE INDEX idx_shop_penalty_tier ON penalty_schema.shop_penalty_status(current_tier_level);