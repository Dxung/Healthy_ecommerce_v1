-- Migration: Add topups table and update payment_transactions
-- Date: 2026-02-03
-- Description:
--   1. Create topups table for tracking wallet topup requests
--   2. Modify payment_transactions to use topup_id instead of wallet_id
--   3. Add necessary indexes and constraints

-- ============================================================================
-- STEP 1: Create topup_status enum
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'topup_status_enum') THEN
        CREATE TYPE payment_schema.topup_status_enum AS ENUM ('processing', 'success', 'failed');
    END IF;
END$$;

-- ============================================================================
-- STEP 2: Create topups table
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_schema.topups (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES payment_schema.wallets(id),
    amount DECIMAL(15, 2) NOT NULL,
    status payment_schema.topup_status_enum NOT NULL DEFAULT 'processing',
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for topups table
CREATE INDEX IF NOT EXISTS idx_topups_wallet_id ON payment_schema.topups(wallet_id);
CREATE INDEX IF NOT EXISTS idx_topups_status ON payment_schema.topups(status);
CREATE INDEX IF NOT EXISTS idx_topups_status_created_at ON payment_schema.topups(status, created_at);

-- ============================================================================
-- STEP 3: Modify payment_transactions table
-- ============================================================================

-- Add topup_id column
ALTER TABLE payment_schema.payment_transactions
ADD COLUMN IF NOT EXISTS topup_id UUID REFERENCES payment_schema.topups(id);

-- Create index for topup_id
CREATE INDEX IF NOT EXISTS idx_payment_transactions_topup_id
ON payment_schema.payment_transactions(topup_id);

-- ============================================================================
-- STEP 4: Migrate existing data (optional - for existing wallet topup transactions)
-- ============================================================================
-- Note: If you have existing topup transactions with wallet_id, you may need to:
-- 1. Create corresponding topup records
-- 2. Link them via topup_id
-- 3. Then remove wallet_id
--
-- For now, we'll keep wallet_id as nullable for backwards compatibility
-- and handle new topups with the new flow.

-- If you want to clean up wallet_id later (after data migration):
-- ALTER TABLE payment_schema.payment_transactions DROP COLUMN wallet_id;

-- Drop the old wallet_id index (optional, if you want to remove wallet_id completely)
-- DROP INDEX IF EXISTS payment_schema.idx_payment_transactions_wallet_id;

-- ============================================================================
-- STEP 5: Add comments for documentation
-- ============================================================================
COMMENT ON TABLE payment_schema.topups IS 'Wallet topup requests - tracks the lifecycle of a topup from creation to completion/failure';
COMMENT ON COLUMN payment_schema.topups.status IS 'processing: waiting for VNPay, success: completed, failed: payment failed or expired';
COMMENT ON COLUMN payment_schema.topups.failure_reason IS 'Reason for failure if status is failed';
COMMENT ON COLUMN payment_schema.topups.processed_at IS 'When the topup was completed or failed';

COMMENT ON COLUMN payment_schema.payment_transactions.topup_id IS 'Reference to topup record (for wallet topup transactions)';
