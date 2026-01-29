CREATE TABLE auth_schema.user_auths (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pv_pvid_auths UNIQUE(provider, provider_id),
    CONSTRAINT uid_pv_auths UNIQUE(user_id, provider),

	CONSTRAINT fk_user_auths_user
        FOREIGN KEY (user_id)
        REFERENCES users_schema.user_core(id)
        ON DELETE CASCADE

	CREATE INDEX idx_user_auths_user_id ON auth_schema.user_auths(user_id);
);