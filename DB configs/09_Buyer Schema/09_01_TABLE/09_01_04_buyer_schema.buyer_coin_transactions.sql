  CREATE TABLE buyer_schema.buyer_coin_transactions (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      buyer_id UUID NOT NULL REFERENCES users_schema.user_core(id),
      type buyer_schema.coin_transaction_type_enum NOT NULL,
      amount BIGINT NOT NULL,
      balance_before BIGINT NOT NULL,
      balance_after BIGINT NOT NULL,
      reference_type VARCHAR(50) NOT NULL,
      reference_id UUID,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_coin_transactions_buyer_id ON buyer_schema.buyer_coin_transactions(buyer_id);
  CREATE INDEX idx_coin_transactions_created_at ON buyer_schema.buyer_coin_transactions(created_at);