CREATE TABLE shop_schema.shop_registration_brand_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      registration_id UUID NOT NULL REFERENCES shop_schema.shop_registration_requests(id) ON DELETE CASCADE,
      document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
      image_url VARCHAR(500) NOT NULL,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_shop_reg_brand_docs ON shop_schema.shop_registration_brand_documents(registration_id);