-- SQL Changes for Phases 1-3
-- This file contains the SQL statements needed to add new permissions for the admin features

-- ============================================================
-- NEW PERMISSIONS (For Phase 2: Admin Features)
-- ============================================================

-- Order Management Permissions
INSERT INTO authorization_schema.permissions (permission_name, resource, action, description)
VALUES
  ('order:read', 'order', 'read', 'View all orders (admin order management)'),
  ('order:update', 'order', 'update', 'Update order status (admin)')
ON CONFLICT (permission_name) DO NOTHING;

-- System Config Permissions
INSERT INTO authorization_schema.permissions (permission_name, resource, action, description)
VALUES
  ('system-config:read', 'system-config', 'read', 'View system configuration'),
  ('system-config:write', 'system-config', 'write', 'Update system configuration')
ON CONFLICT (permission_name) DO NOTHING;

-- ============================================================
-- GRANT PERMISSIONS TO ADMIN ROLE
-- (Assuming there's an admin role with id from the roles table)
-- ============================================================

-- First, find the admin role ID and grant the new permissions
-- Uncomment and run this after the permissions are inserted:

/*
-- Get admin role id
DO $$
DECLARE
    admin_role_id UUID;
    permission_record RECORD;
BEGIN
    -- Get the admin role
    SELECT id INTO admin_role_id
    FROM authorization_schema.roles
    WHERE role_name = 'admin';

    IF admin_role_id IS NOT NULL THEN
        -- Grant order:read permission
        INSERT INTO authorization_schema.roles_have_permissions (role_id, permission_id)
        SELECT admin_role_id, id
        FROM authorization_schema.permissions
        WHERE permission_name = 'order:read'
        ON CONFLICT DO NOTHING;

        -- Grant order:update permission
        INSERT INTO authorization_schema.roles_have_permissions (role_id, permission_id)
        SELECT admin_role_id, id
        FROM authorization_schema.permissions
        WHERE permission_name = 'order:update'
        ON CONFLICT DO NOTHING;

        -- Grant system-config:read permission
        INSERT INTO authorization_schema.roles_have_permissions (role_id, permission_id)
        SELECT admin_role_id, id
        FROM authorization_schema.permissions
        WHERE permission_name = 'system-config:read'
        ON CONFLICT DO NOTHING;

        -- Grant system-config:write permission
        INSERT INTO authorization_schema.roles_have_permissions (role_id, permission_id)
        SELECT admin_role_id, id
        FROM authorization_schema.permissions
        WHERE permission_name = 'system-config:write'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
*/

-- ============================================================
-- OPTIONAL: System Config Table (If you want to persist config to DB)
-- Currently, the system-config module uses in-memory storage.
-- Run this if you want to persist configuration to the database.
-- ============================================================

/*
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

-- Seed default platform fee
INSERT INTO config_schema.system_configs (config_key, config_value, description)
VALUES ('platform_fee_percent', '5', 'Platform fee percentage charged to shops')
ON CONFLICT (config_key) DO NOTHING;
*/

-- ============================================================
-- NO CHANGES REQUIRED FOR:
-- ============================================================
-- - products.is_official_approved column (already exists in schema)
-- - All order table structures (no schema changes, only new queries)
