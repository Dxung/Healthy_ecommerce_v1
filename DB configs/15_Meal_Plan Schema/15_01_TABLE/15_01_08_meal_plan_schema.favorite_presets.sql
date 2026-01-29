-- Favorite Presets
-- User's favorite food presets for quick access

CREATE TABLE meal_plan_schema.favorite_presets (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    preset_id UUID NOT NULL REFERENCES meal_plan_schema.food_presets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, preset_id)
);

CREATE INDEX idx_favorite_presets_user_id ON meal_plan_schema.favorite_presets(user_id);
CREATE INDEX idx_favorite_presets_preset_id ON meal_plan_schema.favorite_presets(preset_id);
