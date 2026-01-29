CREATE TABLE payment_schema.pending_releases (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      escrow_hold_id UUID NOT NULL REFERENCES payment_schema.escrow_holds(id),
      shop_wallet_id UUID NOT NULL REFERENCES payment_schema.wallets(id),
      amount DECIMAL(15,2) NOT NULL,
      status payment_schema.pending_release_status_enum NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5,
      last_error TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP,
      next_retry_at TIMESTAMP
  );

  CREATE INDEX idx_pending_releases_status ON payment_schema.pending_releases(status);
  CREATE INDEX idx_pending_releases_next_retry_at ON payment_schema.pending_releases(next_retry_at);