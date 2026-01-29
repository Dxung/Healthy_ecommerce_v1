  CREATE TABLE product_schema.product_images (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      product_id UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
      image_url VARCHAR(500) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_product_images_product_id ON product_schema.product_images(product_id);