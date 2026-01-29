-- Meal Plan Schema ENUMs

-- Meal type enumeration (6 meals per day)
CREATE TYPE meal_plan_schema.meal_type_enum AS ENUM (
    'breakfast',        -- Bữa sáng
    'morning_snack',    -- Bữa phụ sáng
    'lunch',            -- Bữa trưa
    'afternoon_snack',  -- Bữa phụ chiều
    'dinner',           -- Bữa tối
    'evening_snack'     -- Bữa phụ tối
);

-- Source type for meal log entries
CREATE TYPE meal_plan_schema.meal_source_type_enum AS ENUM (
    'product',  -- From purchased product
    'custom',   -- User-created custom entry
    'preset',   -- From food preset (community or own)
    'quick'     -- Quick add with just calories
);

-- Preset source type
CREATE TYPE meal_plan_schema.preset_source_enum AS ENUM (
    'system',   -- System-provided presets
    'user'      -- User-created presets
);

-- Vote type for preset reactions
CREATE TYPE meal_plan_schema.vote_type_enum AS ENUM (
    'up',       -- Upvote/like
    'down'      -- Downvote/dislike
);

-- Goal type for calorie targets
CREATE TYPE meal_plan_schema.goal_type_enum AS ENUM (
    'lose',     -- Weight loss (-500 kcal)
    'maintain', -- Maintain weight (0 adjustment)
    'gain'      -- Weight gain (+300 kcal)
);

-- Activity level for TDEE calculation
CREATE TYPE meal_plan_schema.activity_level_enum AS ENUM (
    'sedentary',        -- Little or no exercise (x1.2)
    'lightly_active',   -- Light exercise 1-3 days/week (x1.375)
    'moderately_active', -- Moderate exercise 3-5 days/week (x1.55)
    'very_active'       -- Hard exercise 6-7 days/week (x1.725)
);

-- Gender for BMR calculation
CREATE TYPE meal_plan_schema.gender_enum AS ENUM (
    'male',
    'female'
);
