-- Exercise Logs
-- Exercise entries with calories burned

CREATE TABLE meal_plan_schema.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Date
    log_date DATE NOT NULL,

    -- Exercise details
    exercise_name VARCHAR(200) NOT NULL,
    duration_minutes INTEGER NOT NULL,      -- Duration in minutes
    calories_burned DECIMAL(10,2) NOT NULL,

    -- Optional details
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_logs_user_id ON meal_plan_schema.exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_log_date ON meal_plan_schema.exercise_logs(log_date);
CREATE INDEX idx_exercise_logs_user_date ON meal_plan_schema.exercise_logs(user_id, log_date);
