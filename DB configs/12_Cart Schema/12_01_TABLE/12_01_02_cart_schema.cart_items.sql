  CREATE TABLE cart_schema.cart_items (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      cart_id UUID NOT NULL REFERENCES cart_schema.carts(id) ON DELETE CASCADE,
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      product_id UUID NOT NULL REFERENCES product_schema.products(id),
      variant_id UUID NOT NULL REFERENCES product_schema.product_variants(id),
      quantity INTEGER NOT NULL DEFAULT 1,

      -- Snapshot price at add time to detect changes
      price_at_added DECIMAL(15,2) NOT NULL,

      -- Allow select/deselect item when checkout
      is_selected BOOLEAN NOT NULL DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT uq_cart_variant UNIQUE(cart_id, variant_id),
      CONSTRAINT chk_quantity CHECK (quantity > 0)
  );

  CREATE INDEX idx_cart_items_cart_id ON cart_schema.cart_items(cart_id);
  CREATE INDEX idx_cart_items_shop_id ON cart_schema.cart_items(shop_id);
  CREATE INDEX idx_cart_items_product_id ON cart_schema.cart_items(product_id);