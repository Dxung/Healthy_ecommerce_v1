  CREATE TABLE penalty_schema.violation_types (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      code penalty_schema.violation_code_enum UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      points INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );