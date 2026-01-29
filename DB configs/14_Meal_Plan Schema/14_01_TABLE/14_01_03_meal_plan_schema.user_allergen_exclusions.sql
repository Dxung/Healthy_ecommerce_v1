-- User Allergen Exclusions
-- Junction table for user to allergen_tag exclusions

CREATE TABLE meal_plan_schema.user_allergen_exclusions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    allergen_tag_id UUID NOT NULL REFERENCES product_schema.allergen_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, allergen_tag_id)
);

CREATE INDEX idx_user_allergen_exclusions_user_id ON meal_plan_schema.user_allergen_exclusions(user_id);
CREATE INDEX idx_user_allergen_exclusions_allergen_tag_id ON meal_plan_schema.user_allergen_exclusions(allergen_tag_id);
