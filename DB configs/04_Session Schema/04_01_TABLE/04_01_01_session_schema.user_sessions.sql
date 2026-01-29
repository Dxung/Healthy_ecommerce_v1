CREATE TABLE session_schema.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expire_at TIMESTAMP NOT NULL,
    
    CONSTRAINT chk_expire_date CHECK (expire_at > created_at),

	CONSTRAINT fk_user_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users_schema.user_core(id)
        ON DELETE CASCADE

	CREATE INDEX idx_user_sessions_user_id ON session_schema.user_sessions(user_id);
);