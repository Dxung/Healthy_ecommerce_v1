-- Migration: Remove escrow_hold_days and ensure order_auto_complete_days exists
-- Date: 2026-02-02

-- 1. Delete escrow_hold_days (no longer used)
DELETE FROM config_schema.system_configs
WHERE config_key = 'escrow_hold_days';

-- 2. Insert order_auto_complete_days if not exists
INSERT INTO config_schema.system_configs (id, config_key, config_value, description, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'order_auto_complete_days',
    '3',
    'Số ngày sau khi giao hàng để tự động hoàn thành đơn nếu buyer không xác nhận',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM config_schema.system_configs WHERE config_key = 'order_auto_complete_days'
);
