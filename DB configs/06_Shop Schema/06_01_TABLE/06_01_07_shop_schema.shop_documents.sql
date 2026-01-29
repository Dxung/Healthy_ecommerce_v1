  CREATE TABLE shop_schema.shop_documents (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
      image_url VARCHAR(500) NOT NULL,
      expires_at TIMESTAMP,
      status shop_schema.document_status_enum NOT NULL DEFAULT 'pending',
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reviewed_by UUID REFERENCES users_schema.user_core(id),
      reviewed_at TIMESTAMP,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_shop_documents_shop_id ON shop_schema.shop_documents(shop_id);
  CREATE INDEX idx_shop_documents_status ON shop_schema.shop_documents(status);
  CREATE INDEX idx_shop_documents_expires_at ON shop_schema.shop_documents(expires_at);