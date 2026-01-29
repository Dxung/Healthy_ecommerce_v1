CREATE TABLE shop_schema.shop_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES shop_schema.shops(id) ON DELETE CASCADE,
    from_status VARCHAR(20) NULL,
    to_status VARCHAR(20) NOT NULL,
    reason VARCHAR(500) NULL,
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP DEFAULT NOW()
  );

  -- Index for querying history by shop
  CREATE INDEX idx_shop_status_history_shop_id ON shop_schema.shop_status_history(shop_id);