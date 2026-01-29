  CREATE TABLE buyer_schema.buyer_ingredient_allergies (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      buyer_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
      ingredient_name VARCHAR(255) NOT NULL,
      behavior buyer_schema.allergy_behavior_enum NOT NULL DEFAULT 'warn',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT uq_buyer_ingredient UNIQUE(buyer_id, ingredient_name)
  );

  CREATE INDEX idx_buyer_ingredient_allergies_buyer_id ON buyer_schema.buyer_ingredient_allergies(buyer_id);
  CREATE INDEX idx_buyer_ingredient_allergies_name ON buyer_schema.buyer_ingredient_allergies(ingredient_name);