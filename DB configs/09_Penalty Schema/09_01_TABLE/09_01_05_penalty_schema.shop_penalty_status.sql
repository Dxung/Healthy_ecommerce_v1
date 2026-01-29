  CREATE TABLE penalty_schema.shop_violation_history (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      violation_type_id UUID NOT NULL REFERENCES penalty_schema.violation_types(id),
      points INTEGER NOT NULL,
      reason TEXT NOT NULL,
      evidence_urls TEXT[],
      created_by UUID NOT NULL REFERENCES users_schema.user_core(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_violation_history_shop_id ON penalty_schema.shop_violation_history(shop_id);
  CREATE INDEX idx_violation_history_created_at ON penalty_schema.shop_violation_history(created_at);