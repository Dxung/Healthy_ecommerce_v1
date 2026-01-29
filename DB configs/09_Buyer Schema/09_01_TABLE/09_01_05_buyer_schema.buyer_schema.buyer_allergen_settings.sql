  CREATE TABLE buyer_schema.buyer_allergen_settings (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      buyer_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
      allergen_tag_id UUID NOT NULL REFERENCES product_schema.allergen_tags(id) ON DELETE CASCADE,
      behavior buyer_schema.allergy_behavior_enum NOT NULL DEFAULT 'warn',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT uq_buyer_allergen UNIQUE(buyer_id, allergen_tag_id)
  );

  CREATE INDEX idx_buyer_allergen_settings_buyer_id ON buyer_schema.buyer_allergen_settings(buyer_id);