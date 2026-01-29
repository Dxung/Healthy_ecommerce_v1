 CREATE TABLE product_schema.units (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      name VARCHAR(100) NOT NULL,
      symbol VARCHAR(20) UNIQUE NOT NULL,
      category product_schema.unit_category_enum NOT NULL,
      type product_schema.unit_type_enum,
      is_base BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
  );

  CREATE INDEX idx_units_symbol ON product_schema.units(symbol);
  CREATE INDEX idx_units_category ON product_schema.units(category);
  CREATE INDEX idx_units_is_active ON product_schema.units(is_active);