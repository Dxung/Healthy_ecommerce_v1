  CREATE TABLE cart_schema.carts (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      user_id UUID UNIQUE NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

      -- Checkout state (save temp to resume checkout)
      selected_address_id UUID REFERENCES users_schema.user_addresses(id),
      note TEXT,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_carts_user_id ON cart_schema.carts(user_id);