  CREATE TABLE payment_schema.withdrawal_requests (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      wallet_id UUID NOT NULL REFERENCES payment_schema.wallets(id),
      amount DECIMAL(15,2) NOT NULL,
      fee DECIMAL(15,2) NOT NULL DEFAULT 0,
      net_amount DECIMAL(15,2) NOT NULL,
      bank_account_number VARCHAR(50) NOT NULL,
      bank_code VARCHAR(20) NOT NULL,
      account_holder_name VARCHAR(255) NOT NULL,
      status payment_schema.withdrawal_status_enum NOT NULL DEFAULT 'pending',
      processed_at TIMESTAMP,
      failure_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_withdrawal_requests_wallet_id ON payment_schema.withdrawal_requests(wallet_id);
  CREATE INDEX idx_withdrawal_requests_status ON payment_schema.withdrawal_requests(status);