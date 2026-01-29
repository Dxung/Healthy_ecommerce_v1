-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search on food_presets.name
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- For gen_random_bytes() used in uuidv7()

-- ============================================================================
-- UUID v7 Function
-- Generates time-sortable UUIDs (millisecond precision + random)
-- Required for PostgreSQL 17 (native uuidv7() only available in PostgreSQL 18+)
-- ============================================================================
CREATE OR REPLACE FUNCTION uuidv7() RETURNS uuid AS $$
DECLARE
    v_time timestamp with time zone := clock_timestamp();
    v_secs bigint;
    v_msec bigint;
    v_usec bigint;
    v_timestamp bigint;
    v_timestamp_hex varchar;
    v_random bytea;
    v_uuid varchar;
BEGIN
    -- Get milliseconds since Unix epoch
    v_secs := EXTRACT(EPOCH FROM v_time)::bigint;
    v_msec := (EXTRACT(MILLISECONDS FROM v_time)::bigint) % 1000;
    v_timestamp := (v_secs * 1000) + v_msec;

    -- Convert to hex (48 bits = 12 hex chars)
    v_timestamp_hex := lpad(to_hex(v_timestamp), 12, '0');

    -- Get 10 random bytes
    v_random := gen_random_bytes(10);

    -- Build UUID: tttttttt-tttt-7xxx-yxxx-xxxxxxxxxxxx
    -- t = timestamp, 7 = version, y = variant (8,9,a,b), x = random
    v_uuid := substr(v_timestamp_hex, 1, 8) || '-' ||
              substr(v_timestamp_hex, 9, 4) || '-' ||
              '7' || substr(encode(v_random, 'hex'), 1, 3) || '-' ||
              encode(substring(set_byte(substring(v_random from 4 for 1), 0,
                  (get_byte(substring(v_random from 4 for 1), 0) & x'3f'::int) | x'80'::int)
                  from 1 for 1), 'hex') ||
              substr(encode(v_random, 'hex'), 5, 2) || '-' ||
              substr(encode(v_random, 'hex'), 7, 12);

    RETURN v_uuid::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE SCHEMA IF NOT EXISTS users_schema;
CREATE SCHEMA IF NOT EXISTS auth_schema;
CREATE SCHEMA IF NOT EXISTS location_schema;
CREATE SCHEMA IF NOT EXISTS session_schema;
CREATE SCHEMA IF NOT EXISTS authorization_schema;
CREATE SCHEMA IF NOT EXISTS brand_schema;
CREATE SCHEMA IF NOT EXISTS shop_schema;
CREATE SCHEMA IF NOT EXISTS product_schema;
CREATE SCHEMA IF NOT EXISTS penalty_schema;
CREATE SCHEMA IF NOT EXISTS buyer_schema;
CREATE SCHEMA IF NOT EXISTS payment_schema;
CREATE SCHEMA IF NOT EXISTS order_schema;
CREATE SCHEMA IF NOT EXISTS cart_schema;
CREATE SCHEMA IF NOT EXISTS config_schema;
CREATE SCHEMA IF NOT EXISTS meal_plan_schema;
