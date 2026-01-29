  CREATE TABLE buyer_schema.buyer_coin_wallets (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      buyer_id UUID UNIQUE NOT NULL REFERENCES users_schema.user_core(id),
      balance BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_buyer_coin_wallet_buyer_id ON buyer_schema.buyer_coin_wallets(buyer_id);