-- ============================================================================
-- ORDER STATUS ENUM
-- ============================================================================
CREATE TYPE order_schema.order_status_enum AS ENUM (
    'pending',
    'confirmed',
    'shipping',
    'delivered',
    'completed',
    'cancelled',
    'refunding',            -- Đang xử lý hoàn tiền
    'refunded'              -- Đã hoàn tiền
);

-- ============================================================================
-- PAYMENT ENUMS
-- ============================================================================
CREATE TYPE order_schema.payment_status_enum AS ENUM (
    'pending',
    'paid',
    'refunded',
    'partially_refunded'
);

CREATE TYPE order_schema.payment_method_enum AS ENUM (
    'wallet',
    'vnpay',
    'wallet_vnpay',
    'cod'
);

CREATE TYPE order_schema.cancelled_by_enum AS ENUM (
    'buyer',
    'shop',
    'system'
);

-- ============================================================================
-- REFUND REASON TYPE ENUM
-- Phân loại nhóm lý do (admin quản lý các lý do cụ thể trong bảng refund_reason_categories)
-- ============================================================================
CREATE TYPE order_schema.refund_reason_type_enum AS ENUM (
    'refund_only',    -- Lý do cho hoàn tiền không trả hàng
    'return',         -- Lý do cho trả hàng
    'dispute'         -- Lý do cho khiếu nại
);

-- ============================================================================
-- REFUND REQUEST ENUMS
-- ============================================================================
CREATE TYPE order_schema.refund_request_type_enum AS ENUM (
    'refund_only',    -- Hoàn tiền, giữ hàng
    'return'          -- Hoàn tiền + trả hàng
);

CREATE TYPE order_schema.refund_request_status_enum AS ENUM (
    'pending',        -- Chờ shop duyệt
    'approved',       -- Shop đồng ý, đang xử lý hoàn tiền
    'rejected',       -- Shop từ chối
    'completed',      -- Đã hoàn tiền xong
    'cancelled'       -- Buyer hủy yêu cầu / chấp nhận từ chối
);

-- ============================================================================
-- DISPUTE STATUS ENUM
-- ============================================================================
CREATE TYPE order_schema.dispute_status_enum AS ENUM (
    'pending',              -- Chờ admin xử lý
    'evidence_requested',   -- Admin yêu cầu thêm bằng chứng
    'approved',             -- Admin đồng ý hoàn tiền
    'rejected'              -- Admin từ chối
);
