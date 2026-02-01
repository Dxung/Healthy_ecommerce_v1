-- Migration: Create reviews, review_images, and review_replies tables
-- Date: 2026-02-01

-- Create enum type for review status if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status_enum') THEN
        CREATE TYPE product_schema.review_status_enum AS ENUM ('active', 'hidden_due_to_refund', 'deleted');
    END IF;
END$$;

-- Create reviews table
CREATE TABLE IF NOT EXISTS product_schema.reviews (
    id UUID PRIMARY KEY,
    order_item_id UUID NOT NULL,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    shop_id UUID NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    status product_schema.review_status_enum NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id)
        REFERENCES order_schema.order_items(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id)
        REFERENCES user_schema.user_core(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id)
        REFERENCES product_schema.products(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_shop FOREIGN KEY (shop_id)
        REFERENCES shop_schema.shops(id) ON DELETE CASCADE,

    -- Unique constraint: one review per order item
    CONSTRAINT uq_reviews_order_item UNIQUE (order_item_id)
);

-- Create indexes for reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_schema.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop_id ON product_schema.reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_schema.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_schema.reviews(status);

-- Create review_images table
CREATE TABLE IF NOT EXISTS product_schema.review_images (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraint
    CONSTRAINT fk_review_images_review FOREIGN KEY (review_id)
        REFERENCES product_schema.reviews(id) ON DELETE CASCADE
);

-- Create index for review_images table
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON product_schema.review_images(review_id);

-- Create review_replies table
CREATE TABLE IF NOT EXISTS product_schema.review_replies (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL,
    shop_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    -- Foreign key constraints
    CONSTRAINT fk_review_replies_review FOREIGN KEY (review_id)
        REFERENCES product_schema.reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_replies_shop FOREIGN KEY (shop_id)
        REFERENCES shop_schema.shops(id) ON DELETE CASCADE,

    -- Unique constraint: one reply per review
    CONSTRAINT uq_review_replies_review_id UNIQUE (review_id)
);

-- Create indexes for review_replies table
CREATE INDEX IF NOT EXISTS idx_review_replies_review_id ON product_schema.review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_review_replies_shop_id ON product_schema.review_replies(shop_id);

-- Add trigger to update updated_at column on reviews
CREATE OR REPLACE FUNCTION product_schema.update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON product_schema.reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON product_schema.reviews
    FOR EACH ROW
    EXECUTE FUNCTION product_schema.update_reviews_updated_at();

-- Add trigger to update updated_at column on review_replies
CREATE OR REPLACE FUNCTION product_schema.update_review_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_review_replies_updated_at ON product_schema.review_replies;
CREATE TRIGGER trigger_review_replies_updated_at
    BEFORE UPDATE ON product_schema.review_replies
    FOR EACH ROW
    EXECUTE FUNCTION product_schema.update_review_replies_updated_at();
