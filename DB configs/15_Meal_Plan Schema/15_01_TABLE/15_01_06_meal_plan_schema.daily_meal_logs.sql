-- Daily Meal Logs
-- Individual meal entries per day with nutrition snapshots

CREATE TABLE meal_plan_schema.daily_meal_logs (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,

    -- Date and meal type
    log_date DATE NOT NULL,
    meal_type meal_plan_schema.meal_type_enum NOT NULL,

    -- Source tracking
    source_type meal_plan_schema.meal_source_type_enum NOT NULL,
    product_id UUID REFERENCES product_schema.products(id) ON DELETE SET NULL,    -- If source=product
    preset_id UUID REFERENCES meal_plan_schema.food_presets(id) ON DELETE SET NULL, -- If source=preset
    food_name VARCHAR(200) NOT NULL,        -- Display name (always stored)

    -- Quantity & serving snapshot (captured at log time)
    quantity DECIMAL(10,2) NOT NULL,        -- Number of servings
    serving_size_snapshot DECIMAL(10,2),    -- Serving size at log time
    serving_unit_snapshot VARCHAR(20),      -- Serving unit at log time

    -- Logged nutrition values (calculated: quantity * per_serving)
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

CREATE INDEX idx_daily_meal_logs_user_id ON meal_plan_schema.daily_meal_logs(user_id);
CREATE INDEX idx_daily_meal_logs_log_date ON meal_plan_schema.daily_meal_logs(log_date);
CREATE INDEX idx_daily_meal_logs_user_date ON meal_plan_schema.daily_meal_logs(user_id, log_date);
CREATE INDEX idx_daily_meal_logs_meal_type ON meal_plan_schema.daily_meal_logs(meal_type);
CREATE INDEX idx_daily_meal_logs_product_id ON meal_plan_schema.daily_meal_logs(product_id);
CREATE INDEX idx_daily_meal_logs_preset_id ON meal_plan_schema.daily_meal_logs(preset_id);
