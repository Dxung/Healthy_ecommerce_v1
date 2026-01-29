  CREATE TABLE payment_schema.wallet_transactions (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      wallet_id UUID NOT NULL REFERENCES payment_schema.wallets(id),
      type payment_schema.wallet_transaction_type_enum NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      balance_before DECIMAL(15,2) NOT NULL,
      balance_after DECIMAL(15,2) NOT NULL,
      reference_type VARCHAR(50),
      reference_id UUID,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_wallet_transactions_wallet_id ON payment_schema.wallet_transactions(wallet_id);
  CREATE INDEX idx_wallet_transactions_created_at ON payment_schema.wallet_transactions(created_at);