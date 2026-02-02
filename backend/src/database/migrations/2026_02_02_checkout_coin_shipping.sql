-- Migration: Checkout Coin + Shipping Integration
-- Date: 2026-02-02
-- Description: Add platform_ship_discount column to orders, PLATFORM to wallet_owner_type_enum, REFUNDED to coin_transaction_type_enum, create platform wallet

-- Add platform_ship_discount column to orders
ALTER TABLE order_schema.orders
ADD COLUMN IF NOT EXISTS platform_ship_discount DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Add PLATFORM to wallet_owner_type_enum
ALTER TYPE payment_schema.wallet_owner_type_enum ADD VALUE IF NOT EXISTS 'platform';

-- Add REFUNDED to coin_transaction_type_enum
ALTER TYPE buyer_schema.coin_transaction_type_enum ADD VALUE IF NOT EXISTS 'refunded';

-- Create platform wallet (singleton, immutable by users/admins)
-- Using fixed UUIDs:
--   Wallet ID: 00000000-0000-0000-0000-000000000001
--   Owner ID:  00000000-0000-0000-0000-000000000000 (represents "PLATFORM" entity)
INSERT INTO payment_schema.wallets (id, owner_type, owner_id, balance, frozen_balance, min_balance, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'platform',
    '00000000-0000-0000-0000-000000000000',
    0,
    0,
    0,
    NOW()
)
ON CONFLICT (id) DO NOTHING;
