  CREATE TABLE order_schema.order_items (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      order_id UUID NOT NULL REFERENCES order_schema.orders(id),
      product_id UUID NOT NULL REFERENCES product_schema.products(id),
      variant_id UUID NOT NULL REFERENCES product_schema.product_variants(id),
      product_name VARCHAR(500) NOT NULL,
      variant_name VARCHAR(255) NOT NULL,
      product_image_url VARCHAR(500) NOT NULL,
      unit_price DECIMAL(15,2) NOT NULL,
      quantity INTEGER NOT NULL,
      total_price DECIMAL(15,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_order_items_order_id ON order_schema.order_items(order_id);
  CREATE INDEX idx_order_items_product_id ON order_schema.order_items(product_id);
  CREATE INDEX idx_order_items_refund_status ON order_schema.order_items(refund_status);