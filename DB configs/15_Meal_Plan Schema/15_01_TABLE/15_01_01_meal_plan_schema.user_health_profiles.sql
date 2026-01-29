-- User Health Profiles
-- Stores user's physical attributes and calorie goals for TDEE calculation

CREATE TABLE meal_plan_schema.user_health_profiles (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID UNIQUE NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Physical attributes for TDEE calculation
    weight_kg DECIMAL(5,2),                 -- Current weight in kg
    height_cm DECIMAL(5,2),                 -- Height in cm
    birth_date DATE,                        -- For age calculation
    gender meal_plan_schema.gender_enum,
    activity_level meal_plan_schema.activity_level_enum DEFAULT 'sedentary',

    -- Goals
    goal_type meal_plan_schema.goal_type_enum DEFAULT 'maintain',
    calorie_target INTEGER,                 -- Manual override or calculated
    is_calorie_target_manual BOOLEAN DEFAULT FALSE,  -- True if user set manually

    -- Streak tracking
    current_streak INTEGER DEFAULT 0,       -- Current consecutive days logged
    longest_streak INTEGER DEFAULT 0,       -- Best streak ever
    last_log_date DATE,                     -- Last date with meal log

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_health_profiles_user_id ON meal_plan_schema.user_health_profiles(user_id);
CREATE INDEX idx_user_health_profiles_last_log_date ON meal_plan_schema.user_health_profiles(last_log_date);
