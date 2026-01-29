  CREATE TABLE shop_schema.shop_official_brands (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      brand_id UUID NOT NULL,
      status shop_schema.brand_status_enum NOT NULL DEFAULT 'pending',
      granted_at TIMESTAMP,
      expired_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_shop_brand UNIQUE(shop_id, brand_id)
  );

  CREATE INDEX idx_shop_official_brands_shop_id ON shop_schema.shop_official_brands(shop_id);
  CREATE INDEX idx_shop_official_brands_brand_id ON shop_schema.shop_official_brands(brand_id);
  CREATE INDEX idx_shop_official_brands_status ON shop_schema.shop_official_brands(status);