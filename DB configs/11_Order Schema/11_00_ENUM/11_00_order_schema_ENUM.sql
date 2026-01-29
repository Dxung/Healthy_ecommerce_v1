  CREATE TYPE order_schema.order_status_enum AS ENUM (
      'pending',
      'confirmed',
      'shipping',
      'delivered',
      'completed',
      'cancelled',
      'refunding',
      'refunded'
  );
  CREATE TYPE order_schema.payment_status_enum AS ENUM ('pending', 'paid', 'refunded', 'partially_refunded');
  CREATE TYPE order_schema.payment_method_enum AS ENUM ('wallet', 'vnpay', 'wallet_vnpay', 'cod');
  CREATE TYPE order_schema.cancelled_by_enum AS ENUM ('buyer', 'shop', 'system');
  CREATE TYPE order_schema.refund_status_enum AS ENUM ('none', 'pending', 'refunded');
