CREATE SCHEMA IF NOT EXISTS config_schema;

CREATE TABLE config_schema.system_configs (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_configs_key ON config_schema.system_configs(config_key);
