  CREATE TABLE order_schema.orders (
      id UUID PRIMARY KEY DEFAULT uuidv7(),
      order_code VARCHAR(50) UNIQUE NOT NULL,
      buyer_id UUID NOT NULL REFERENCES users_schema.user_core(id),
      shop_id UUID NOT NULL REFERENCES shop_schema.shops(id),
      receiver_name VARCHAR(255) NOT NULL,
      receiver_phone VARCHAR(20) NOT NULL,
      shipping_address TEXT NOT NULL,
      shipping_ward_id VARCHAR(50),
      shipping_district_id VARCHAR(50),
      shipping_province_id VARCHAR(50),
      subtotal DECIMAL(15,2) NOT NULL,
      shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
      platform_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
      platform_fee_percent DECIMAL(5,2) NOT NULL,
      tier_discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
      tier_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
      voucher_discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
      coin_used BIGINT NOT NULL DEFAULT 0,
      total_amount DECIMAL(15,2) NOT NULL,
      buyer_tier_code VARCHAR(20) NOT NULL,
      coin_multiplier DECIMAL(3,2) NOT NULL,
      coin_earned BIGINT NOT NULL DEFAULT 0,
      payment_method order_schema.payment_method_enum NOT NULL,
      payment_status order_schema.payment_status_enum NOT NULL DEFAULT 'pending',
      paid_at TIMESTAMP,
      status order_schema.order_status_enum NOT NULL DEFAULT 'pending',
      confirmed_at TIMESTAMP,
      shipped_at TIMESTAMP,
      delivered_at TIMESTAMP,
      completed_at TIMESTAMP,
      cancelled_at TIMESTAMP,
      cancel_reason TEXT,
      cancelled_by order_schema.cancelled_by_enum,
      buyer_note TEXT,
      shop_note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX idx_orders_order_code ON order_schema.orders(order_code);
  CREATE INDEX idx_orders_buyer_id ON order_schema.orders(buyer_id);
  CREATE INDEX idx_orders_shop_id ON order_schema.orders(shop_id);
  CREATE INDEX idx_orders_status ON order_schema.orders(status);
  CREATE INDEX idx_orders_created_at ON order_schema.orders(created_at);