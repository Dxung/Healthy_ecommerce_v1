-- User Follows
-- Follow relationships for preset creators

CREATE TABLE meal_plan_schema.user_follows (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    follower_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users_schema.user_core(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)  -- Cannot follow self
);

CREATE INDEX idx_user_follows_follower_id ON meal_plan_schema.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON meal_plan_schema.user_follows(following_id);
