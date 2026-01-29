-- User Diet Preferences
-- Junction table for user to diet_tag relationships

CREATE TABLE meal_plan_schema.user_diet_preferences (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    diet_tag_id UUID NOT NULL REFERENCES product_schema.diet_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, diet_tag_id)
);

CREATE INDEX idx_user_diet_preferences_user_id ON meal_plan_schema.user_diet_preferences(user_id);
CREATE INDEX idx_user_diet_preferences_diet_tag_id ON meal_plan_schema.user_diet_preferences(diet_tag_id);
