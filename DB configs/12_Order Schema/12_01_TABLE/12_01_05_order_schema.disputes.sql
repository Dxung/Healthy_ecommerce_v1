-- ============================================================================
-- DISPUTES
-- Khiếu nại từ buyer khi bị shop từ chối hoàn tiền/trả hàng
-- ============================================================================
CREATE TABLE order_schema.disputes (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    refund_request_id UUID NOT NULL REFERENCES order_schema.refund_requests(id),
    order_id UUID NOT NULL REFERENCES order_schema.orders(id),

    -- Lý do khiếu nại (dropdown riêng cho dispute)
    reason_category_id UUID NOT NULL REFERENCES order_schema.refund_reason_categories(id),
    reason_detail TEXT,
    evidence_urls TEXT[],

    -- Trạng thái
    status order_schema.dispute_status_enum NOT NULL DEFAULT 'pending',

    -- Buyer tạo
    created_by UUID NOT NULL REFERENCES users_schema.user_core(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Admin xử lý
    assigned_admin_id UUID REFERENCES users_schema.user_core(id),
    admin_note TEXT,

    -- Yêu cầu thêm bằng chứng
    evidence_request_note TEXT,
    evidence_requested_at TIMESTAMP,

    -- Buyer bổ sung bằng chứng
    additional_evidence_urls TEXT[],
    additional_evidence_note TEXT,
    additional_evidence_at TIMESTAMP,

    -- Kết quả xử lý
    resolved_by UUID REFERENCES users_schema.user_core(id),
    resolved_at TIMESTAMP,
    resolution_note TEXT,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index cho các query phổ biến
CREATE INDEX idx_disputes_refund_request_id ON order_schema.disputes(refund_request_id);
CREATE INDEX idx_disputes_order_id ON order_schema.disputes(order_id);
CREATE INDEX idx_disputes_status ON order_schema.disputes(status);
CREATE INDEX idx_disputes_created_by ON order_schema.disputes(created_by);
CREATE INDEX idx_disputes_assigned_admin_id ON order_schema.disputes(assigned_admin_id);

-- Index cho admin dashboard (disputes pending)
CREATE INDEX idx_disputes_pending
ON order_schema.disputes(status, created_at)
WHERE status IN ('pending', 'evidence_requested');
