  CREATE TABLE payment_schema.withdrawal_schedules (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      name VARCHAR(100) NOT NULL,
      days INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
