-- Per-brand document requirements (for official badge)
  CREATE TABLE shop_schema.brand_document_requirements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id UUID NOT NULL REFERENCES brand_schema.brands(id),
      document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
      is_required BOOLEAN NOT NULL DEFAULT TRUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT uq_brand_doc_req UNIQUE(brand_id, document_type_id)
  );

  CREATE INDEX idx_brand_doc_req_brand ON shop_schema.brand_document_requirements(brand_id);