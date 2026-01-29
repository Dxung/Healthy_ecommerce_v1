  -- Shop Badges
  INSERT INTO shop_schema.shop_badges (code, name, description, platform_fee_discount_percent, search_boost_multiplier, max_product_slots) VALUES
  ('preferred', 'Shop Yêu Thích', 'Shop đạt các chỉ tiêu về đánh giá và tỷ lệ đơn hàng thành công', 2.00, 1.20, 5000),
  ('approved', 'Shop Uy Tín', 'Shop đã xác minh giấy tờ kinh doanh', NULL, NULL, 1000),
  ('official', 'Shop Chính Hãng', 'Shop bán hàng chính hãng được ủy quyền', 6.00, 1.50, 10000);

  -- Buyer Tiers
  INSERT INTO buyer_schema.buyer_tiers (code, name, min_spending_6_months, coin_multiplier, direct_discount_percent) VALUES
  ('bronze', 'Đồng', 0, 1.00, 0),
  ('silver', 'Bạc', 3000000, 1.20, 0.50),
  ('gold', 'Vàng', 10000000, 1.50, 1.00),
  ('platinum', 'Bạch Kim', 50000000, 2.00, 2.00);

  -- Penalty Tiers
  INSERT INTO penalty_schema.penalty_tiers (level, name, min_points, max_points) VALUES
  (0, 'Không phạt', 0, 9),
  (1, 'Cảnh cáo', 10, 19),
  (2, 'Hạn chế', 20, 39),
  (3, 'Nghiêm trọng', 40, 59),
  (4, 'Khóa vĩnh viễn', 60, NULL);

  -- Penalty Tier Effects
  INSERT INTO penalty_schema.penalty_tier_effects (penalty_tier_level, effect_code, is_enabled) VALUES
  (1, 'search_priority_reduced', TRUE),
  (2, 'search_priority_reduced', TRUE),
  (2, 'hidden_from_search', TRUE),
  (3, 'search_priority_reduced', TRUE),
  (3, 'hidden_from_search', TRUE),
  (3, 'product_edit_blocked', TRUE),
  (4, 'account_frozen', TRUE);

  -- Violation Types
  INSERT INTO penalty_schema.violation_types (code, name, description, points) VALUES
  ('order_cancelled', 'Hủy đơn hàng', 'Shop hủy đơn hoặc không xác nhận đơn quá thời hạn', 5),
  ('order_not_confirmed', 'Không xác nhận đơn', 'Không xác nhận đơn hàng trong thời gian quy định', 3),
  ('wrong_product_name', 'Tên sản phẩm sai', 'Đặt tên sản phẩm không chính xác hoặc gây hiểu nhầm', 5),
  ('wrong_category', 'Sai ngành hàng', 'Đăng sản phẩm sai danh mục', 5),
  ('prohibited_item', 'Hàng cấm', 'Bán các mặt hàng bị cấm', 20),
  ('counterfeit', 'Hàng giả/nhái', 'Bán hàng giả, hàng nhái, hàng vi phạm bản quyền', 30),
  ('fake_orders', 'Đơn hàng ảo', 'Tạo đơn hàng ảo để tăng doanh số/đánh giá', 25);

  INSERT INTO authorization_schema.permissions (permission_name, resource, action, description)
  VALUES
    -- User permissions
    ('user:read', 'user', 'read', 'View user profile and information'),
    ('user:update', 'user', 'update', 'Update user profile and settings'),

    -- Session permissions
    ('session:read', 'session', 'read', 'View active sessions'),
    ('session:delete', 'session', 'delete', 'Delete/revoke sessions'),

    -- Shop permissions (for later)
    ('shop:create', 'shop', 'create', 'Create a shop'),
    ('shop:read', 'shop', 'read', 'View shop information'),
    ('shop:update', 'shop', 'update', 'Update shop information'),
    ('shop:delete', 'shop', 'delete', 'Delete shop'),

    -- Product permissions (for later)
    ('product:create', 'product', 'create', 'Create products'),
    ('product:read', 'product', 'read', 'View products'),
    ('product:update', 'product', 'update', 'Update products'),
    ('product:delete', 'product', 'delete', 'Delete products'),

    -- Role/Permission management (admin only)
    ('role:read', 'role', 'read', 'View roles'),
    ('role:assign', 'role', 'assign', 'Assign roles to users'),
    ('role:revoke', 'role', 'revoke', 'Revoke roles from users'),
    ('permission:read', 'permission', 'read', 'View permissions'),
    ('permission:grant', 'permission', 'grant', 'Grant permissions to roles'),
    ('permission:revoke', 'permission', 'revoke', 'Revoke permissions from roles');

	SELECT * FROM authorization_schema.permissions;

	TRUNCATE TABLE authorization_schema.permissions RESTART IDENTITY CASCADE;