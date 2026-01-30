-- Per-brand document requirements (for Official badge applications)
CREATE TABLE shop_schema.brand_document_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brand_schema.brands(id),
    document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_brand_document_requirement UNIQUE(brand_id, document_type_id)
);

CREATE INDEX idx_brand_doc_requirements_brand_id ON shop_schema.brand_document_requirements(brand_id);

-- Trigger for updated_at
CREATE TRIGGER set_timestamp_brand_document_requirements
    BEFORE UPDATE ON shop_schema.brand_document_requirements
    FOR EACH ROW
    EXECUTE FUNCTION shop_schema.trigger_set_timestamp();
