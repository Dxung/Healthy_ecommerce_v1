  CREATE TABLE shop_schema.shop_brand_documents (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      shop_official_brand_id UUID NOT NULL REFERENCES shop_schema.shop_official_brands(id),
      document_type_id UUID NOT NULL REFERENCES shop_schema.official_brand_document_types(id),
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

  CREATE INDEX idx_shop_brand_documents_brand_id ON shop_schema.shop_brand_documents(shop_official_brand_id);
  CREATE INDEX idx_shop_brand_documents_expires_at ON shop_schema.shop_brand_documents(expires_at);