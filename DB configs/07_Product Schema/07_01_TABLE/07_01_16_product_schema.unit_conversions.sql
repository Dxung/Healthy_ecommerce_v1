  CREATE TABLE product_schema.unit_conversions (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      from_unit_id UUID NOT NULL REFERENCES product_schema.units(id) ON DELETE CASCADE,
      to_unit_id UUID NOT NULL REFERENCES product_schema.units(id) ON DELETE CASCADE,
      conversion_factor DECIMAL(20, 10) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_unit_conversion_pair UNIQUE (from_unit_id, to_unit_id),
      CONSTRAINT chk_no_self_conversion CHECK (from_unit_id != to_unit_id)
  );

  CREATE INDEX idx_unit_conversions_from_unit ON product_schema.unit_conversions(from_unit_id);
  CREATE INDEX idx_unit_conversions_to_unit ON product_schema.unit_conversions(to_unit_id);