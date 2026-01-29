  CREATE TABLE payment_schema.payment_transactions (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      wallet_id UUID REFERENCES payment_schema.wallets(id),
      order_id UUID,
      type payment_schema.payment_type_enum NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      status payment_schema.payment_status_enum NOT NULL DEFAULT 'pending',
      vnpay_txn_ref VARCHAR(100) UNIQUE NOT NULL,
      vnpay_transaction_no VARCHAR(100),
      vnpay_response_code VARCHAR(10),
      vnpay_response_message TEXT,
      vnpay_bank_code VARCHAR(20),
      vnpay_bank_tran_no VARCHAR(100),
      vnpay_pay_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_payment_transactions_wallet_id ON payment_schema.payment_transactions(wallet_id);
  CREATE INDEX idx_payment_transactions_order_id ON payment_schema.payment_transactions(order_id);
  CREATE INDEX idx_payment_transactions_vnpay_ref ON payment_schema.payment_transactions(vnpay_txn_ref);
  CREATE INDEX idx_payment_transactions_status ON payment_schema.payment_transactions(status);