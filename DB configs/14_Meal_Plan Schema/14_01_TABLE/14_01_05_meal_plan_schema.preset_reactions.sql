-- Preset Reactions
-- Like/dislike votes on food presets

CREATE TABLE meal_plan_schema.preset_reactions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    preset_id UUID NOT NULL REFERENCES meal_plan_schema.food_presets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    vote_type meal_plan_schema.vote_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(preset_id, user_id)
);

CREATE INDEX idx_preset_reactions_preset_id ON meal_plan_schema.preset_reactions(preset_id);
CREATE INDEX idx_preset_reactions_user_id ON meal_plan_schema.preset_reactions(user_id);
