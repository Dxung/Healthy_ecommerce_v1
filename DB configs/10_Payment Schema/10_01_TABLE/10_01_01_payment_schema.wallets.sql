  CREATE TABLE payment_schema.wallets (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      owner_type payment_schema.wallet_owner_type_enum NOT NULL,
      owner_id UUID NOT NULL,
      balance DECIMAL(15,2) NOT NULL DEFAULT 0,
      frozen_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
      min_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_wallet_owner UNIQUE(owner_type, owner_id)
  );

  CREATE INDEX idx_wallets_owner ON payment_schema.wallets(owner_type, owner_id);