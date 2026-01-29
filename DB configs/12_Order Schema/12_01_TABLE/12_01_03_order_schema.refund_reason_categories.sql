-- ============================================================================
-- REFUND REASON CATEGORIES
-- Admin quản lý các nhóm lý do hoàn tiền/trả hàng/khiếu nại qua FE
-- ============================================================================
CREATE TABLE order_schema.refund_reason_categories (
    id UUID PRIMARY KEY DEFAULT uuidv7(),
    name VARCHAR(255) NOT NULL,
    type order_schema.refund_reason_type_enum NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Index cho query dropdown (lọc theo type, active, không bị xóa)
CREATE INDEX idx_refund_reason_categories_type
ON order_schema.refund_reason_categories(type)
WHERE deleted_at IS NULL;

CREATE INDEX idx_refund_reason_categories_active
ON order_schema.refund_reason_categories(is_active)
WHERE deleted_at IS NULL;

-- Unique name trong cùng type (chỉ khi chưa bị xóa)
CREATE UNIQUE INDEX idx_refund_reason_categories_name_type_unique
ON order_schema.refund_reason_categories(name, type)
WHERE deleted_at IS NULL;
