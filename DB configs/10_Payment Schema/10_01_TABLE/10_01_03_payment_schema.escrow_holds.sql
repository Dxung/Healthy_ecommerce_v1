  CREATE TABLE payment_schema.escrow_holds (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      order_id UUID NOT NULL,
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      amount DECIMAL(15,2) NOT NULL,
      status payment_schema.escrow_status_enum NOT NULL DEFAULT 'holding',
      released_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_escrow_holds_order_id ON payment_schema.escrow_holds(order_id);
  CREATE INDEX idx_escrow_holds_shop_id ON payment_schema.escrow_holds(shop_id);
  CREATE INDEX idx_escrow_holds_status ON payment_schema.escrow_holds(status);