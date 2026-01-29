CREATE TABLE product_schema.product_diet_tags (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    product_id UUID NOT NULL REFERENCES product_schema.products(id) ON DELETE CASCADE,
    diet_tag_id UUID NOT NULL REFERENCES product_schema.diet_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_diet UNIQUE(product_id, diet_tag_id)
);

CREATE INDEX idx_product_diet_tags_product_id ON product_schema.product_diet_tags(product_id);
CREATE INDEX idx_product_diet_tags_diet_tag_id ON product_schema.product_diet_tags(diet_tag_id);
