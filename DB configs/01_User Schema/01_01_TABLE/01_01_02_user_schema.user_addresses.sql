CREATE TABLE users_schema.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id UUID NOT NULL,
    label VARCHAR(50) DEFAULT 'HOME' NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    ward_id VARCHAR(50) NOT NULL,
    district_id VARCHAR(50) NOT NULL,
    province_id VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_address_user
        FOREIGN KEY (user_id)
        REFERENCES users_schema.user_core(id)
        ON DELETE CASCADE
);

	CREATE UNIQUE INDEX idx_only_one_default 
		ON users_schema.user_addresses (user_id) 
		WHERE is_default = TRUE;