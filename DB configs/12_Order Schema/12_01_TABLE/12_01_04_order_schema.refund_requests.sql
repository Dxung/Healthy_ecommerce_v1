-- ============================================================================
-- REFUND REQUESTS
-- Yêu cầu hoàn tiền / trả hàng từ buyer
-- ============================================================================
CREATE TABLE order_schema.refund_requests (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    order_id UUID NOT NULL REFERENCES order_schema.orders(id),
    order_item_id UUID REFERENCES order_schema.order_items(id),  -- NULL = hoàn cả đơn

    -- Loại yêu cầu & số lượng
    type order_schema.refund_request_type_enum NOT NULL,
    quantity_requested INTEGER NOT NULL,
    refund_amount DECIMAL(15,2) NOT NULL,

    -- Lý do (dropdown + chi tiết)
    reason_category_id UUID NOT NULL REFERENCES order_schema.refund_reason_categories(id),
    reason_detail TEXT,
    evidence_urls TEXT[],

    -- Trạng thái
    status order_schema.refund_request_status_enum NOT NULL DEFAULT 'pending',

    -- Buyer yêu cầu
    requested_by UUID NOT NULL REFERENCES users_schema.user_core(id),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Shop duyệt
    reviewed_by UUID REFERENCES users_schema.user_core(id),
    reviewed_at TIMESTAMP,
    review_note TEXT,

    -- Hoàn tiền
    refunded_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index cho các query phổ biến
CREATE INDEX idx_refund_requests_order_id ON order_schema.refund_requests(order_id);
CREATE INDEX idx_refund_requests_order_item_id ON order_schema.refund_requests(order_item_id);
CREATE INDEX idx_refund_requests_status ON order_schema.refund_requests(status);
CREATE INDEX idx_refund_requests_requested_by ON order_schema.refund_requests(requested_by);
CREATE INDEX idx_refund_requests_type ON order_schema.refund_requests(type);

-- Index cho CRON job kiểm tra đơn hàng có request pending
CREATE INDEX idx_refund_requests_order_status
ON order_schema.refund_requests(order_id, status)
WHERE status IN ('pending', 'approved');
