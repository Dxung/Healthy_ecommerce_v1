  CREATE TABLE payment_schema.payment_attempts (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      payment_transaction_id UUID NOT NULL REFERENCES payment_schema.payment_transactions(id),
      attempt_number INTEGER NOT NULL DEFAULT 1,
      request_amount DECIMAL(15,2) NOT NULL,
      request_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      request_ip VARCHAR(45),
      response_code VARCHAR(10),
      response_message TEXT,
      response_at TIMESTAMP,
      is_success BOOLEAN NOT NULL DEFAULT FALSE,
      failure_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_payment_attempts_transaction_id ON payment_schema.payment_attempts(payment_transaction_id);