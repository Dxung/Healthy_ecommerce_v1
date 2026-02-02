-- Migration: Optimize indexes for order cronjobs
-- Date: 2026-02-02
-- Description:
--   - Add composite index (status, payment_status) for payment timeout and refund cronjobs
--   - Add index on delivered_at for auto-complete cronjob
--   - Remove redundant idx_orders_status (covered by composite index)

-- =====================================================
-- 1. DROP REDUNDANT INDEX: status (single column)
-- Reason: Composite index (status, payment_status) covers queries on status alone
--         due to "leftmost prefix" rule
-- =====================================================

DROP INDEX IF EXISTS order_schema.idx_orders_status;

-- =====================================================
-- 2. COMPOSITE INDEX: status + payment_status
-- Used by:
--   - findPendingOrdersForPaymentCheck (status='pending', payment_status='pending')
--   - findCancelledOrdersNeedingRefund (status='cancelled', payment_status='paid')
--   - Any query filtering by status only (leftmost prefix)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_status_payment_status
ON order_schema.orders (status, payment_status);

-- =====================================================
-- 3. INDEX: delivered_at
-- Used by:
--   - findOrdersForAutoComplete (status='delivered', delivered_at < cutoff)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_delivered_at
ON order_schema.orders (delivered_at)
WHERE delivered_at IS NOT NULL;

-- =====================================================
-- VERIFICATION: Check indexes after migration
-- =====================================================
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'orders' AND schemaname = 'order_schema';
