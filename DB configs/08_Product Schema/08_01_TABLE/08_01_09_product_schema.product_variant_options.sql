  CREATE TABLE product_schema.product_variant_options (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      variant_id UUID NOT NULL REFERENCES product_schema.product_variants(id) ON DELETE CASCADE,
      option_value_id UUID NOT NULL REFERENCES product_schema.product_option_values(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_variant_option UNIQUE(variant_id, option_value_id)
  );

  CREATE INDEX idx_variant_options_variant_id ON product_schema.product_variant_options(variant_id);