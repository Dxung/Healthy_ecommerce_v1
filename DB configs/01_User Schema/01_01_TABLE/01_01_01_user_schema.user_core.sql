CREATE TABLE users_schema.user_core (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500) NOT NULL,
    date_of_birth DATE,
    gender users_schema.gender_enum,
    status users_schema.user_status_enum NOT NULL DEFAULT 'active',
    date_of_birth_changed_at TIMESTAMP,
    gender_changed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);