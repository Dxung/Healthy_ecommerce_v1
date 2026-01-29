CREATE TABLE brand_schema.brands (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE UNIQUE INDEX idx_brands_slug_unique
ON brand_schema.brands(slug)
WHERE deleted_at IS NULL;

CREATE INDEX idx_brands_slug ON brand_schema.brands(slug);
CREATE INDEX idx_brands_name ON brand_schema.brands(name);
