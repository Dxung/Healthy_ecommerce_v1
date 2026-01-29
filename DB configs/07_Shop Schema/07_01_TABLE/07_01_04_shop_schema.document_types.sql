  CREATE TABLE shop_schema.document_types (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      sample_image_url VARCHAR(500),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );