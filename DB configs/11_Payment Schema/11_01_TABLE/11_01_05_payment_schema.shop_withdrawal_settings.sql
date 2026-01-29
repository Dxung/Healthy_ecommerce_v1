  CREATE TABLE payment_schema.shop_withdrawal_settings (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID UNIQUE NOT NULL REFERENCES shop_schema.shops(id),
      schedule_id UUID NOT NULL REFERENCES payment_schema.withdrawal_schedules(id),
      bank_account_number VARCHAR(50) NOT NULL,
      bank_code VARCHAR(20) NOT NULL,
      account_holder_name VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );