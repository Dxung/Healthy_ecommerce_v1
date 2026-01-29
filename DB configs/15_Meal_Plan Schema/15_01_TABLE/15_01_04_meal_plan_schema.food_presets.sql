-- Food Presets
-- Custom/community meal presets with nutrition info

CREATE TABLE meal_plan_schema.food_presets (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    creator_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),

    -- Serving info
    serving_size DECIMAL(10,2) NOT NULL,
    serving_unit VARCHAR(20) NOT NULL,

    -- Macros per serving
    calories DECIMAL(10,2) NOT NULL,
    protein DECIMAL(10,2),
    carbohydrates DECIMAL(10,2),
    fat DECIMAL(10,2),
    fiber DECIMAL(10,2),
    sugar DECIMAL(10,2),
    sodium DECIMAL(10,2),

    -- Visibility and metadata
    source meal_plan_schema.preset_source_enum DEFAULT 'user',
    is_public BOOLEAN DEFAULT FALSE,        -- Visible in community search

    -- Engagement counters (denormalized for performance)
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,            -- How many times used in meal logs

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_presets_creator_id ON meal_plan_schema.food_presets(creator_id);
CREATE INDEX idx_food_presets_is_public ON meal_plan_schema.food_presets(is_public);
CREATE INDEX idx_food_presets_source ON meal_plan_schema.food_presets(source);
CREATE INDEX idx_food_presets_name_trgm ON meal_plan_schema.food_presets USING GIN (name gin_trgm_ops);
