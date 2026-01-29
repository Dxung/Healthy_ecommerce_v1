  CREATE TABLE product_schema.product_variants (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      product_id UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
      sku VARCHAR(100),
      name VARCHAR(255) NOT NULL,
      price DECIMAL(15,2) NOT NULL,
      compare_at_price DECIMAL(15,2),
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      image_url VARCHAR(500),
      selling_unit_id UUID REFERENCES product_schema.units(id),
      unit_quantity DECIMAL(10,3),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      expiry_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
  );

  CREATE INDEX idx_product_variants_product_id ON product_schema.product_variants(product_id);
  CREATE INDEX idx_product_variants_sku ON product_schema.product_variants(sku);
  CREATE INDEX idx_product_variants_selling_unit_id ON product_schema.product_variants(selling_unit_id);
  CREATE INDEX idx_product_variants_expiry_date ON product_schema.product_variants(expiry_date);