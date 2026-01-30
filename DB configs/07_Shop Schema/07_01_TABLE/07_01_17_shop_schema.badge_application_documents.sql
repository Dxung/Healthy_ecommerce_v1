-- Badge Application Documents table
-- Documents submitted with badge applications
CREATE TABLE shop_schema.badge_application_documents (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL REFERENCES shop_schema.badge_applications(id) ON DELETE CASCADE,
    document_type_id UUID NOT NULL REFERENCES shop_schema.document_types(id),
    image_url VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,  -- Expiration date of the document (required)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_badge_app_docs_application_id ON shop_schema.badge_application_documents(application_id);

COMMENT ON TABLE shop_schema.badge_application_documents IS 'Documents submitted with badge applications';
COMMENT ON COLUMN shop_schema.badge_application_documents.expires_at IS 'Expiration date of the document - required for badge applications';
