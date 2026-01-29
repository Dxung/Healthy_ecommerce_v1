  CREATE TYPE payment_schema.wallet_owner_type_enum AS ENUM ('buyer', 'shop');
  CREATE TYPE payment_schema.wallet_transaction_type_enum AS ENUM (
      'topup',
      'order_payment',
      'escrow_release',
      'refund_received',
      'withdrawal',
      'refund_deducted',
      'platform_fee'
  );
  CREATE TYPE payment_schema.escrow_status_enum AS ENUM ('holding', 'released', 'refunded');
  CREATE TYPE payment_schema.withdrawal_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
  CREATE TYPE payment_schema.payment_status_enum AS ENUM ('pending', 'success', 'failed', 'cancelled');
  CREATE TYPE payment_schema.payment_type_enum AS ENUM ('topup', 'order_payment');
  CREATE TYPE payment_schema.pending_release_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');