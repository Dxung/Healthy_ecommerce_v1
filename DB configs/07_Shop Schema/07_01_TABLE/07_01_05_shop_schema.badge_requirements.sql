-- Unified badge requirements (for all badges: preferred, approved, official)
  CREATE TABLE shop_schema.badge_requirements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      badge_code shop_schema.badge_code_enum NOT NULL,
      requirement_type shop_schema.requirement_type_enum NOT NULL,
      document_type_id UUID REFERENCES shop_schema.document_types(id),
      attribute_code shop_schema.shop_attribute_code_enum,
      operator shop_schema.comparison_operator_enum,
      attribute_value DECIMAL(10,2),
      is_required BOOLEAN NOT NULL DEFAULT TRUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT chk_document_fields CHECK (
          requirement_type != 'document' OR document_type_id IS NOT NULL
      ),
      CONSTRAINT chk_attribute_fields CHECK (
          requirement_type != 'attribute' OR (
              attribute_code IS NOT NULL AND
              operator IS NOT NULL AND
              attribute_value IS NOT NULL
          )
      )
  );

  CREATE INDEX idx_badge_req_badge ON shop_schema.badge_requirements(badge_code);
  CREATE INDEX idx_badge_req_type ON shop_schema.badge_requirements(requirement_type);