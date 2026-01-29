  CREATE TABLE product_schema.products (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      category_id UUID NOT NULL REFERENCES product_schema.categories(id),
      brand_id UUID REFERENCES brand_schema.brands(id),
      name VARCHAR(500) NOT NULL,
      slug VARCHAR(500) NOT NULL,
      description TEXT,
      thumbnail_url VARCHAR(500) NOT NULL,
      min_price DECIMAL(15,2) NOT NULL DEFAULT 0,
      max_price DECIMAL(15,2) NOT NULL DEFAULT 0,
      total_sold INTEGER NOT NULL DEFAULT 0,
      average_rating DECIMAL(3,2) NOT NULL DEFAULT 0,
      total_ratings INTEGER NOT NULL DEFAULT 0,
      is_official_approved BOOLEAN NOT NULL DEFAULT FALSE,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      status product_schema.product_status_enum NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,
      CONSTRAINT uq_product_shop_slug UNIQUE(shop_id, slug)
  );

  CREATE INDEX idx_products_shop_id ON product_schema.products(shop_id);
  CREATE INDEX idx_products_category_id ON product_schema.products(category_id);
  CREATE INDEX idx_products_brand_id ON product_schema.products(brand_id);
  CREATE INDEX idx_products_status ON product_schema.products(status);
  CREATE INDEX idx_products_is_visible ON product_schema.products(is_visible);