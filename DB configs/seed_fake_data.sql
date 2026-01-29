-- ============================================================================
-- SEED FAKE DATA SCRIPT - HEALTHY FOOD ECOMMERCE
-- Preserves existing: categories, brands, allergen_tags, users, sessions
-- ============================================================================

-- ============================================================================
-- 1. UNITS (product_schema.units)
-- ============================================================================
INSERT INTO product_schema.units (id, name, symbol, category, type, is_base, is_active)
SELECT * FROM (VALUES
    ('019bc001-0001-7000-0001-000000000001'::UUID, 'Gram', 'g', 'measurement'::product_schema.unit_category_enum, 'weight'::product_schema.unit_type_enum, true, true),
    ('019bc001-0001-7000-0001-000000000002'::UUID, 'Kilogram', 'kg', 'measurement'::product_schema.unit_category_enum, 'weight'::product_schema.unit_type_enum, false, true),
    ('019bc001-0001-7000-0001-000000000003'::UUID, 'Milliliter', 'ml', 'measurement'::product_schema.unit_category_enum, 'volume'::product_schema.unit_type_enum, true, true),
    ('019bc001-0001-7000-0001-000000000004'::UUID, 'Liter', 'L', 'measurement'::product_schema.unit_category_enum, 'volume'::product_schema.unit_type_enum, false, true),
    ('019bc001-0001-7000-0001-000000000005'::UUID, 'Cái', 'cái', 'selling'::product_schema.unit_category_enum, 'quantity'::product_schema.unit_type_enum, true, true),
    ('019bc001-0001-7000-0001-000000000006'::UUID, 'Hộp', 'hộp', 'selling'::product_schema.unit_category_enum, 'quantity'::product_schema.unit_type_enum, false, true),
    ('019bc001-0001-7000-0001-000000000007'::UUID, 'Gói', 'gói', 'selling'::product_schema.unit_category_enum, 'quantity'::product_schema.unit_type_enum, false, true),
    ('019bc001-0001-7000-0001-000000000008'::UUID, 'Chai', 'chai', 'selling'::product_schema.unit_category_enum, 'quantity'::product_schema.unit_type_enum, false, true),
    ('019bc001-0001-7000-0001-000000000009'::UUID, 'Lon', 'lon', 'selling'::product_schema.unit_category_enum, 'quantity'::product_schema.unit_type_enum, false, true),
    ('019bc001-0001-7000-0001-000000000010'::UUID, 'Túi', 'túi', 'selling'::product_schema.unit_category_enum, 'quantity'::product_schema.unit_type_enum, false, true)
) AS v(id, name, symbol, category, type, is_base, is_active)
WHERE NOT EXISTS (SELECT 1 FROM product_schema.units WHERE symbol = v.symbol);

-- ============================================================================
-- 2. DIET TAGS (product_schema.diet_tags)
-- ============================================================================
INSERT INTO product_schema.diet_tags (id, name, slug, description, icon_url, is_active)
SELECT * FROM (VALUES
    ('019bc002-0001-7000-0001-000000000001'::UUID, 'Thuần chay', 'thuan-chay', 'Sản phẩm không chứa thành phần từ động vật', NULL::VARCHAR, true),
    ('019bc002-0001-7000-0001-000000000002'::UUID, 'Chay lacto-ovo', 'chay-lacto-ovo', 'Sản phẩm chay có thể chứa trứng và sữa', NULL, true),
    ('019bc002-0001-7000-0001-000000000003'::UUID, 'Không gluten', 'khong-gluten', 'Sản phẩm không chứa gluten, phù hợp người celiac', NULL, true),
    ('019bc002-0001-7000-0001-000000000004'::UUID, 'Keto', 'keto', 'Phù hợp chế độ ăn Keto - ít carb, nhiều chất béo', NULL, true),
    ('019bc002-0001-7000-0001-000000000005'::UUID, 'Low Carb', 'low-carb', 'Ít carbohydrate, phù hợp giảm cân', NULL, true),
    ('019bc002-0001-7000-0001-000000000006'::UUID, 'Hữu cơ', 'huu-co', 'Sản phẩm organic được chứng nhận', NULL, true),
    ('019bc002-0001-7000-0001-000000000007'::UUID, 'Không đường', 'khong-duong', 'Không chứa đường tinh luyện', NULL, true),
    ('019bc002-0001-7000-0001-000000000008'::UUID, 'Giàu Protein', 'giau-protein', 'Hàm lượng protein cao, tốt cho gym', NULL, true),
    ('019bc002-0001-7000-0001-000000000009'::UUID, 'Whole30', 'whole30', 'Phù hợp chế độ Whole30', NULL, true),
    ('019bc002-0001-7000-0001-000000000010'::UUID, 'Paleo', 'paleo', 'Phù hợp chế độ ăn Paleo', NULL, true)
) AS v(id, name, slug, description, icon_url, is_active)
WHERE NOT EXISTS (SELECT 1 FROM product_schema.diet_tags WHERE slug = v.slug);

-- ============================================================================
-- 3. SYSTEM CONFIGS (config_schema.system_configs)
-- ============================================================================
INSERT INTO config_schema.system_configs (id, config_key, config_value, description)
SELECT * FROM (VALUES
    ('019bc008-0001-7000-0001-000000000001'::UUID, 'PLATFORM_FEE_PERCENT', '5', 'Phí nền tảng tính trên mỗi đơn hàng (%)'),
    ('019bc008-0001-7000-0001-000000000002'::UUID, 'ORDER_CONFIRM_TIMEOUT_HOURS', '24', 'Thời gian chờ xác nhận đơn hàng (giờ)'),
    ('019bc008-0001-7000-0001-000000000003'::UUID, 'REVIEW_WINDOW_DAYS', '30', 'Số ngày được phép đánh giá sau khi hoàn thành đơn'),
    ('019bc008-0001-7000-0001-000000000004'::UUID, 'ESCROW_RELEASE_DELAY_HOURS', '72', 'Thời gian giữ tiền escrow sau khi giao hàng (giờ)'),
    ('019bc008-0001-7000-0001-000000000005'::UUID, 'MAX_CART_ITEMS', '50', 'Số lượng sản phẩm tối đa trong giỏ hàng'),
    ('019bc008-0001-7000-0001-000000000006'::UUID, 'MIN_ORDER_AMOUNT', '50000', 'Giá trị đơn hàng tối thiểu (VND)'),
    ('019bc008-0001-7000-0001-000000000007'::UUID, 'COIN_TO_VND_RATE', '1', 'Tỷ lệ quy đổi 1 coin = ? VND'),
    ('019bc008-0001-7000-0001-000000000008'::UUID, 'MAX_COIN_USE_PERCENT', '50', 'Phần trăm tối đa dùng coin cho đơn hàng')
) AS v(id, config_key, config_value, description)
WHERE NOT EXISTS (SELECT 1 FROM config_schema.system_configs WHERE config_key = v.config_key);

-- ============================================================================
-- 4. CATEGORIES - Healthy Food Categories (Level 1, 2, 3)
-- Only insert if no categories exist
-- ============================================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM product_schema.categories;

    IF v_count = 0 THEN
        -- Level 1 Categories (Parent = NULL)
        INSERT INTO product_schema.categories (id, parent_id, name, slug, icon_url, level, is_active, sort_order) VALUES
        ('019bc010-0001-7000-0001-000000000001', NULL, 'Thực phẩm hữu cơ', 'thuc-pham-huu-co', NULL, 1, true, 1),
        ('019bc010-0001-7000-0001-000000000002', NULL, 'Đồ uống healthy', 'do-uong-healthy', NULL, 1, true, 2),
        ('019bc010-0001-7000-0001-000000000003', NULL, 'Snack & Bánh lành mạnh', 'snack-banh-lanh-manh', NULL, 1, true, 3),
        ('019bc010-0001-7000-0001-000000000004', NULL, 'Ngũ cốc & Hạt', 'ngu-coc-hat', NULL, 1, true, 4),
        ('019bc010-0001-7000-0001-000000000005', NULL, 'Thực phẩm chức năng', 'thuc-pham-chuc-nang', NULL, 1, true, 5),
        ('019bc010-0001-7000-0001-000000000006', NULL, 'Thực phẩm chay', 'thuc-pham-chay', NULL, 1, true, 6);

        -- Level 2 Categories
        -- Under "Thực phẩm hữu cơ"
        INSERT INTO product_schema.categories (id, parent_id, name, slug, icon_url, level, is_active, sort_order) VALUES
        ('019bc010-0002-7000-0001-000000000001', '019bc010-0001-7000-0001-000000000001', 'Rau củ hữu cơ', 'rau-cu-huu-co', NULL, 2, true, 1),
        ('019bc010-0002-7000-0001-000000000002', '019bc010-0001-7000-0001-000000000001', 'Trái cây hữu cơ', 'trai-cay-huu-co', NULL, 2, true, 2),
        ('019bc010-0002-7000-0001-000000000003', '019bc010-0001-7000-0001-000000000001', 'Thịt & Trứng hữu cơ', 'thit-trung-huu-co', NULL, 2, true, 3);

        -- Under "Đồ uống healthy"
        INSERT INTO product_schema.categories (id, parent_id, name, slug, icon_url, level, is_active, sort_order) VALUES
        ('019bc010-0002-7000-0001-000000000004', '019bc010-0001-7000-0001-000000000002', 'Nước ép & Smoothie', 'nuoc-ep-smoothie', NULL, 2, true, 1),
        ('019bc010-0002-7000-0001-000000000005', '019bc010-0001-7000-0001-000000000002', 'Trà thảo mộc', 'tra-thao-moc', NULL, 2, true, 2),
        ('019bc010-0002-7000-0001-000000000006', '019bc010-0001-7000-0001-000000000002', 'Sữa hạt', 'sua-hat', NULL, 2, true, 3);

        -- Under "Snack & Bánh lành mạnh"
        INSERT INTO product_schema.categories (id, parent_id, name, slug, icon_url, level, is_active, sort_order) VALUES
        ('019bc010-0002-7000-0001-000000000007', '019bc010-0001-7000-0001-000000000003', 'Bánh protein', 'banh-protein', NULL, 2, true, 1),
        ('019bc010-0002-7000-0001-000000000008', '019bc010-0001-7000-0001-000000000003', 'Snack rau củ', 'snack-rau-cu', NULL, 2, true, 2),
        ('019bc010-0002-7000-0001-000000000009', '019bc010-0001-7000-0001-000000000003', 'Granola & Energy bar', 'granola-energy-bar', NULL, 2, true, 3);

        -- Under "Ngũ cốc & Hạt"
        INSERT INTO product_schema.categories (id, parent_id, name, slug, icon_url, level, is_active, sort_order) VALUES
        ('019bc010-0002-7000-0001-000000000010', '019bc010-0001-7000-0001-000000000004', 'Yến mạch', 'yen-mach', NULL, 2, true, 1),
        ('019bc010-0002-7000-0001-000000000011', '019bc010-0001-7000-0001-000000000004', 'Hạt dinh dưỡng', 'hat-dinh-duong', NULL, 2, true, 2),
        ('019bc010-0002-7000-0001-000000000012', '019bc010-0001-7000-0001-000000000004', 'Gạo lứt & Quinoa', 'gao-lut-quinoa', NULL, 2, true, 3);

        RAISE NOTICE 'Created healthy food categories';
    ELSE
        RAISE NOTICE 'Categories already exist, skipping...';
    END IF;
END $$;

-- ============================================================================
-- 5. BRANDS - Healthy Food Brands
-- Only insert if no brands exist
-- ============================================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM product_schema.brands;

    IF v_count = 0 THEN
        INSERT INTO product_schema.brands (id, name, slug, logo_url, description, is_active) VALUES
        ('019bc011-0001-7000-0001-000000000001', 'Organica', 'organica', NULL, 'Thương hiệu thực phẩm hữu cơ hàng đầu Việt Nam', true),
        ('019bc011-0001-7000-0001-000000000002', 'Dalat GAP', 'dalat-gap', NULL, 'Rau củ sạch từ Đà Lạt', true),
        ('019bc011-0001-7000-0001-000000000003', 'Việt Healthy', 'viet-healthy', NULL, 'Thực phẩm lành mạnh cho người Việt', true),
        ('019bc011-0001-7000-0001-000000000004', 'Nature Box', 'nature-box', NULL, 'Snack healthy nhập khẩu', true),
        ('019bc011-0001-7000-0001-000000000005', 'Green Farm', 'green-farm', NULL, 'Nông sản xanh, sạch', true),
        ('019bc011-0001-7000-0001-000000000006', 'FitFood', 'fitfood', NULL, 'Thực phẩm cho người tập gym', true),
        ('019bc011-0001-7000-0001-000000000007', 'Nutiva', 'nutiva', NULL, 'Superfood organic nhập khẩu', true),
        ('019bc011-0001-7000-0001-000000000008', 'Bob Red Mill', 'bob-red-mill', NULL, 'Ngũ cốc nguyên hạt cao cấp', true);

        RAISE NOTICE 'Created healthy food brands';
    ELSE
        RAISE NOTICE 'Brands already exist, skipping...';
    END IF;
END $$;

-- ============================================================================
-- 6. PRODUCTS & VARIANTS - Using existing shop, category, brand
-- ============================================================================
DO $$
DECLARE
    v_shop_id UUID;
    v_cat_id UUID;
    v_brand_id UUID;
    v_product_id UUID;
    v_variant_id UUID;
    v_image_id UUID;
BEGIN
    -- Get first active shop
    SELECT id INTO v_shop_id FROM shop_schema.shops WHERE status = 'active' LIMIT 1;
    -- Get first active category
    SELECT id INTO v_cat_id FROM product_schema.categories WHERE is_active = true LIMIT 1;
    -- Get first active brand
    SELECT id INTO v_brand_id FROM product_schema.brands WHERE is_active = true LIMIT 1;

    IF v_shop_id IS NULL THEN
        RAISE NOTICE 'No active shop found. Skipping product creation.';
        RETURN;
    END IF;

    IF v_cat_id IS NULL THEN
        RAISE NOTICE 'No active category found. Skipping product creation.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating products for shop: %, category: %, brand: %', v_shop_id, v_cat_id, v_brand_id;

    -- Product 1: Yến mạch nguyên cám
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'yen-mach-nguyen-cam-organic' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000001'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Yến mạch nguyên cám Organic', 'yen-mach-nguyen-cam-organic',
                'Yến mạch nguyên cám hữu cơ, giàu chất xơ và protein. Hoàn hảo cho bữa sáng lành mạnh.',
                'https://picsum.photos/seed/oats/400/400', 89000, 159000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000001'::UUID, v_product_id, 'YM-500G', 'Gói 500g', 89000, 99000, 100, true),
               ('019bc021-0001-7000-0001-000000000002'::UUID, v_product_id, 'YM-1KG', 'Gói 1kg', 159000, 180000, 50, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000001'::UUID, v_product_id, 'https://picsum.photos/seed/oats1/800/800', 1),
               ('019bc022-0001-7000-0001-000000000002'::UUID, v_product_id, 'https://picsum.photos/seed/oats2/800/800', 2);
    END IF;

    -- Product 2: Hạt chia Peru
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'hat-chia-peru-organic' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000002'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Hạt chia Peru Organic', 'hat-chia-peru-organic',
                'Hạt chia nhập khẩu từ Peru, giàu omega-3, chất xơ và protein thực vật.',
                'https://picsum.photos/seed/chia/400/400', 120000, 220000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000003'::UUID, v_product_id, 'HC-250G', 'Gói 250g', 120000, 135000, 80, true),
               ('019bc021-0001-7000-0001-000000000004'::UUID, v_product_id, 'HC-500G', 'Gói 500g', 220000, 250000, 45, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000003'::UUID, v_product_id, 'https://picsum.photos/seed/chia1/800/800', 1);
    END IF;

    -- Product 3: Mật ong rừng nguyên chất
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'mat-ong-rung-nguyen-chat' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000003'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Mật ong rừng nguyên chất', 'mat-ong-rung-nguyen-chat',
                'Mật ong rừng 100% tự nhiên, không pha trộn. Thu hoạch từ vùng núi Tây Bắc.',
                'https://picsum.photos/seed/honey/400/400', 250000, 450000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000005'::UUID, v_product_id, 'MO-500ML', 'Chai 500ml', 250000, NULL, 60, true),
               ('019bc021-0001-7000-0001-000000000006'::UUID, v_product_id, 'MO-1L', 'Chai 1 lít', 450000, 480000, 30, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000004'::UUID, v_product_id, 'https://picsum.photos/seed/honey1/800/800', 1);
    END IF;

    -- Product 4: Bột protein Whey
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'bot-protein-whey-vanilla' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000004'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Bột Protein Whey vị Vanilla', 'bot-protein-whey-vanilla',
                'Whey protein concentrate 80%, hỗ trợ tăng cơ và phục hồi sau tập luyện.',
                'https://picsum.photos/seed/protein/400/400', 650000, 1200000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000007'::UUID, v_product_id, 'PW-1KG', 'Hộp 1kg', 650000, 700000, 40, true),
               ('019bc021-0001-7000-0001-000000000008'::UUID, v_product_id, 'PW-2KG', 'Hộp 2kg', 1200000, 1350000, 25, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000005'::UUID, v_product_id, 'https://picsum.photos/seed/protein1/800/800', 1);
    END IF;

    -- Product 5: Trà xanh Matcha
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'tra-xanh-matcha-nhat-ban' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000005'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Trà xanh Matcha Nhật Bản', 'tra-xanh-matcha-nhat-ban',
                'Bột matcha ceremonial grade từ Uji, Kyoto. Giàu chất chống oxy hóa.',
                'https://picsum.photos/seed/matcha/400/400', 280000, 520000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000009'::UUID, v_product_id, 'MC-100G', 'Hộp 100g', 280000, 320000, 35, true),
               ('019bc021-0001-7000-0001-000000000010'::UUID, v_product_id, 'MC-200G', 'Hộp 200g', 520000, 600000, 20, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000006'::UUID, v_product_id, 'https://picsum.photos/seed/matcha1/800/800', 1);
    END IF;

    -- Product 6: Granola mix hạt
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'granola-mix-hat-dinh-duong' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000006'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Granola Mix Hạt Dinh Dưỡng', 'granola-mix-hat-dinh-duong',
                'Granola homemade với yến mạch, hạnh nhân, óc chó, hạt điều và mật ong.',
                'https://picsum.photos/seed/granola/400/400', 95000, 220000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000011'::UUID, v_product_id, 'GR-400G', 'Hũ 400g', 95000, 110000, 90, true),
               ('019bc021-0001-7000-0001-000000000012'::UUID, v_product_id, 'GR-1KG', 'Hũ 1kg', 220000, 250000, 45, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000007'::UUID, v_product_id, 'https://picsum.photos/seed/granola1/800/800', 1);
    END IF;

    -- Product 7: Sữa hạt óc chó
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'sua-hat-oc-cho-khong-duong' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000007'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Sữa hạt óc chó không đường', 'sua-hat-oc-cho-khong-duong',
                'Sữa hạt óc chó tự nhiên, không đường, không chất bảo quản. Tốt cho não bộ.',
                'https://picsum.photos/seed/walnutmilk/400/400', 85000, 85000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000013'::UUID, v_product_id, 'SOC-1L', 'Chai 1 lít', 85000, 95000, 80, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000008'::UUID, v_product_id, 'https://picsum.photos/seed/walnutmilk1/800/800', 1);
    END IF;

    -- Product 8: Energy Bar
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'thanh-nang-luong-protein-bar' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000008'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Thanh năng lượng Protein Bar', 'thanh-nang-luong-protein-bar',
                'Protein bar với 20g protein, ít đường, phù hợp ăn vặt lành mạnh.',
                'https://picsum.photos/seed/proteinbar/400/400', 35000, 180000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000014'::UUID, v_product_id, 'PB-1PC', '1 thanh', 35000, 40000, 200, true),
               ('019bc021-0001-7000-0001-000000000015'::UUID, v_product_id, 'PB-6PC', 'Hộp 6 thanh', 180000, 210000, 50, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000009'::UUID, v_product_id, 'https://picsum.photos/seed/proteinbar1/800/800', 1);
    END IF;

    -- Product 9: Dầu dừa organic
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'dau-dua-organic-ep-lanh' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000009'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Dầu dừa Organic ép lạnh', 'dau-dua-organic-ep-lanh',
                'Dầu dừa nguyên chất ép lạnh, dùng để nấu ăn, làm đẹp và chăm sóc tóc.',
                'https://picsum.photos/seed/coconutoil/400/400', 150000, 280000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000016'::UUID, v_product_id, 'DD-500ML', 'Hũ 500ml', 150000, 170000, 70, true),
               ('019bc021-0001-7000-0001-000000000017'::UUID, v_product_id, 'DD-1L', 'Hũ 1 lít', 280000, 320000, 35, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000010'::UUID, v_product_id, 'https://picsum.photos/seed/coconutoil1/800/800', 1);
    END IF;

    -- Product 10: Gạo lứt đen
    IF NOT EXISTS (SELECT 1 FROM product_schema.products WHERE slug = 'gao-lut-den-huu-co' AND shop_id = v_shop_id) THEN
        v_product_id := '019bc020-0001-7000-0001-000000000010'::UUID;
        INSERT INTO product_schema.products (id, shop_id, category_id, brand_id, name, slug, description, thumbnail_url, min_price, max_price, status, is_visible)
        VALUES (v_product_id, v_shop_id, v_cat_id, v_brand_id, 'Gạo lứt đen hữu cơ', 'gao-lut-den-huu-co',
                'Gạo lứt đen organic, giàu anthocyanin chống oxy hóa, tốt cho tim mạch.',
                'https://picsum.photos/seed/blackrice/400/400', 75000, 180000, 'approved', true);

        INSERT INTO product_schema.product_variants (id, product_id, sku, name, price, compare_at_price, stock_quantity, is_active)
        VALUES ('019bc021-0001-7000-0001-000000000018'::UUID, v_product_id, 'GLD-1KG', 'Túi 1kg', 75000, 85000, 100, true),
               ('019bc021-0001-7000-0001-000000000019'::UUID, v_product_id, 'GLD-3KG', 'Túi 3kg', 180000, 210000, 40, true);

        INSERT INTO product_schema.product_images (id, product_id, image_url, sort_order)
        VALUES ('019bc022-0001-7000-0001-000000000011'::UUID, v_product_id, 'https://picsum.photos/seed/blackrice1/800/800', 1);
    END IF;

    RAISE NOTICE 'Created 10 healthy food products with variants and images';
END $$;

-- ============================================================================
-- 7. WALLETS for existing shops (if not exist)
-- ============================================================================
DO $$
DECLARE
    v_shop RECORD;
BEGIN
    FOR v_shop IN SELECT id FROM shop_schema.shops WHERE status = 'active' LIMIT 5 LOOP
        IF NOT EXISTS (
            SELECT 1 FROM payment_schema.wallets
            WHERE owner_type = 'shop' AND owner_id = v_shop.id
        ) THEN
            INSERT INTO payment_schema.wallets (id, owner_type, owner_id, balance, frozen_balance, min_balance)
            VALUES (gen_random_uuid(), 'shop', v_shop.id, (1000000 + (random() * 5000000))::DECIMAL(15,2), 0, 0);
            RAISE NOTICE 'Created wallet for shop %', v_shop.id;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- DONE - Summary
-- ============================================================================
SELECT 'SEED COMPLETED!' AS status;

SELECT 'Units' AS table_name, COUNT(*) AS count FROM product_schema.units
UNION ALL SELECT 'Diet Tags', COUNT(*) FROM product_schema.diet_tags
UNION ALL SELECT 'System Configs', COUNT(*) FROM config_schema.system_configs
UNION ALL SELECT 'Categories', COUNT(*) FROM product_schema.categories
UNION ALL SELECT 'Brands', COUNT(*) FROM product_schema.brands
UNION ALL SELECT 'Products', COUNT(*) FROM product_schema.products
UNION ALL SELECT 'Product Variants', COUNT(*) FROM product_schema.product_variants
UNION ALL SELECT 'Product Images', COUNT(*) FROM product_schema.product_images
UNION ALL SELECT 'Wallets', COUNT(*) FROM payment_schema.wallets
ORDER BY table_name;
