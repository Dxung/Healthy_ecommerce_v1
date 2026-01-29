CREATE TABLE product_schema.product_allergen_tags (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    product_id UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
    allergen_tag_id UUID NOT NULL REFERENCES product_schema.allergen_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_allergen UNIQUE(product_id, allergen_tag_id)
);

CREATE INDEX idx_product_allergen_tags_product_id ON product_schema.product_allergen_tags(product_id);
CREATE INDEX idx_product_allergen_tags_allergen_tag_id ON product_schema.product_allergen_tags(allergen_tag_id);
