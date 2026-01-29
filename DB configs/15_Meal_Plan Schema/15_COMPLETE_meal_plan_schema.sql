-- ============================================================================
-- MEAL PLAN SCHEMA - COMPLETE SETUP SCRIPT
-- Run this file to create all meal_plan_schema tables
-- ============================================================================

-- Prerequisites:
-- 1. meal_plan_schema must exist (from 00_initialization.sql)
-- 2. users_schema.user_core must exist
-- 3. product_schema.products must exist
-- 4. product_schema.diet_tags must exist
-- 5. product_schema.allergen_tags must exist
-- 6. pg_trgm extension must be enabled

-- ============================================================================
-- STEP 1: Verify schema exists
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS meal_plan_schema;

-- ============================================================================
-- STEP 2: Create ENUMs (if not exist)
-- ============================================================================

-- Meal type enumeration (6 meals per day)
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.meal_type_enum AS ENUM (
        'breakfast',        -- Bữa sáng
        'morning_snack',    -- Bữa phụ sáng
        'lunch',            -- Bữa trưa
        'afternoon_snack',  -- Bữa phụ chiều
        'dinner',           -- Bữa tối
        'evening_snack'     -- Bữa phụ tối
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Source type for meal log entries
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.meal_source_type_enum AS ENUM (
        'product',  -- From purchased product
        'custom',   -- User-created custom entry
        'preset',   -- From food preset (community or own)
        'quick'     -- Quick add with just calories
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Preset source type
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.preset_source_enum AS ENUM (
        'system',   -- System-provided presets
        'user'      -- User-created presets
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Vote type for preset reactions
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.vote_type_enum AS ENUM (
        'up',       -- Upvote/like
        'down'      -- Downvote/dislike
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Goal type for calorie targets
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.goal_type_enum AS ENUM (
        'lose',     -- Weight loss (-500 kcal)
        'maintain', -- Maintain weight (0 adjustment)
        'gain'      -- Weight gain (+300 kcal)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Activity level for TDEE calculation
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.activity_level_enum AS ENUM (
        'sedentary',        -- Little or no exercise (x1.2)
        'lightly_active',   -- Light exercise 1-3 days/week (x1.375)
        'moderately_active', -- Moderate exercise 3-5 days/week (x1.55)
        'very_active'       -- Hard exercise 6-7 days/week (x1.725)
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Gender for BMR calculation
DO $$ BEGIN
    CREATE TYPE meal_plan_schema.gender_enum AS ENUM (
        'male',
        'female'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 3: Create Tables
-- ============================================================================

-- 3.1 User Health Profiles
CREATE TABLE IF NOT EXISTS meal_plan_schema.user_health_profiles (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID UNIQUE NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Physical attributes for TDEE calculation
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    birth_date DATE,
    gender meal_plan_schema.gender_enum,
    activity_level meal_plan_schema.activity_level_enum DEFAULT 'sedentary',

    -- Goals
    goal_type meal_plan_schema.goal_type_enum DEFAULT 'maintain',
    calorie_target INTEGER,
    is_calorie_target_manual BOOLEAN DEFAULT FALSE,

    -- Streak tracking
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_log_date DATE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_health_profiles_user_id ON meal_plan_schema.user_health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_health_profiles_last_log_date ON meal_plan_schema.user_health_profiles(last_log_date);

-- 3.2 User Diet Preferences
CREATE TABLE IF NOT EXISTS meal_plan_schema.user_diet_preferences (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    diet_tag_id UUID NOT NULL REFERENCES product_schema.diet_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, diet_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_user_diet_preferences_user_id ON meal_plan_schema.user_diet_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_diet_preferences_diet_tag_id ON meal_plan_schema.user_diet_preferences(diet_tag_id);

-- 3.3 User Allergen Exclusions
CREATE TABLE IF NOT EXISTS meal_plan_schema.user_allergen_exclusions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    allergen_tag_id UUID NOT NULL REFERENCES product_schema.allergen_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, allergen_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_user_allergen_exclusions_user_id ON meal_plan_schema.user_allergen_exclusions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_allergen_exclusions_allergen_tag_id ON meal_plan_schema.user_allergen_exclusions(allergen_tag_id);

-- 3.4 Food Presets
CREATE TABLE IF NOT EXISTS meal_plan_schema.food_presets (
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
    is_public BOOLEAN DEFAULT FALSE,

    -- Engagement counters
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_food_presets_creator_id ON meal_plan_schema.food_presets(creator_id);
CREATE INDEX IF NOT EXISTS idx_food_presets_is_public ON meal_plan_schema.food_presets(is_public);
CREATE INDEX IF NOT EXISTS idx_food_presets_source ON meal_plan_schema.food_presets(source);
CREATE INDEX IF NOT EXISTS idx_food_presets_name_trgm ON meal_plan_schema.food_presets USING GIN (name gin_trgm_ops);

-- 3.5 Preset Reactions
CREATE TABLE IF NOT EXISTS meal_plan_schema.preset_reactions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    preset_id UUID NOT NULL REFERENCES meal_plan_schema.food_presets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    vote_type meal_plan_schema.vote_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(preset_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_preset_reactions_preset_id ON meal_plan_schema.preset_reactions(preset_id);
CREATE INDEX IF NOT EXISTS idx_preset_reactions_user_id ON meal_plan_schema.preset_reactions(user_id);

-- 3.6 Daily Meal Logs
CREATE TABLE IF NOT EXISTS meal_plan_schema.daily_meal_logs (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Date and meal type
    log_date DATE NOT NULL,
    meal_type meal_plan_schema.meal_type_enum NOT NULL,

    -- Source tracking
    source_type meal_plan_schema.meal_source_type_enum NOT NULL,
    product_id UUID REFERENCES product_schema.products(id) ON DELETE SET NULL,
    preset_id UUID REFERENCES meal_plan_schema.food_presets(id) ON DELETE SET NULL,
    food_name VARCHAR(200) NOT NULL,

    -- Quantity & serving snapshot
    quantity DECIMAL(10,2) NOT NULL,
    serving_size_snapshot DECIMAL(10,2),
    serving_unit_snapshot VARCHAR(20),

    -- Logged nutrition values
    calories_logged DECIMAL(10,2) NOT NULL,
    protein_logged DECIMAL(10,2),
    carbs_logged DECIMAL(10,2),
    fat_logged DECIMAL(10,2),
    fiber_logged DECIMAL(10,2),
    sugar_logged DECIMAL(10,2),
    sodium_logged DECIMAL(10,2),

    -- Notes
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_meal_logs_user_id ON meal_plan_schema.daily_meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_meal_logs_log_date ON meal_plan_schema.daily_meal_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_daily_meal_logs_user_date ON meal_plan_schema.daily_meal_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_meal_logs_meal_type ON meal_plan_schema.daily_meal_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_daily_meal_logs_product_id ON meal_plan_schema.daily_meal_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_daily_meal_logs_preset_id ON meal_plan_schema.daily_meal_logs(preset_id);

-- 3.7 Exercise Logs
CREATE TABLE IF NOT EXISTS meal_plan_schema.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Date
    log_date DATE NOT NULL,

    -- Exercise details
    exercise_name VARCHAR(200) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    calories_burned DECIMAL(10,2) NOT NULL,

    -- Optional details
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_id ON meal_plan_schema.exercise_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_log_date ON meal_plan_schema.exercise_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_user_date ON meal_plan_schema.exercise_logs(user_id, log_date);

-- 3.8 Favorite Presets
CREATE TABLE IF NOT EXISTS meal_plan_schema.favorite_presets (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    preset_id UUID NOT NULL REFERENCES meal_plan_schema.food_presets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, preset_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_presets_user_id ON meal_plan_schema.favorite_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_presets_preset_id ON meal_plan_schema.favorite_presets(preset_id);

-- 3.9 User Follows
CREATE TABLE IF NOT EXISTS meal_plan_schema.user_follows (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    follower_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON meal_plan_schema.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON meal_plan_schema.user_follows(following_id);

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Meal Plan Schema created successfully!' AS status;
