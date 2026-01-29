-- ============================================================================
-- SEED DATA: Food Presets for Users
-- Users: 019ba8f8-66e0-73bd-834e-72b47e90507f, 019bd22a-f48b-724b-9918-09158785e76b
-- ============================================================================

-- User 1: 019ba8f8-66e0-73bd-834e-72b47e90507f
-- Healthy breakfast and snack presets

INSERT INTO meal_plan_schema.food_presets (
    id, creator_id, name, description, image_url,
    serving_size, serving_unit, calories,
    protein, carbohydrates, fat, fiber, sugar, sodium,
    source, is_public, upvote_count, downvote_count, use_count,
    created_at, updated_at
) VALUES
-- Preset 1: Oatmeal with fruits
(
    '019be001-0001-7000-0001-000000000001',
    '019ba8f8-66e0-73bd-834e-72b47e90507f',
    'Yến mạch trái cây buổi sáng',
    'Yến mạch nấu với sữa hạnh nhân, chuối, dâu tây và mật ong. Bữa sáng giàu chất xơ và năng lượng.',
    NULL,
    250, 'g', 320,
    12, 58, 6, 8, 18, 45,
    'user', true, 15, 2, 28,
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'
),
-- Preset 2: Greek yogurt parfait
(
    '019be001-0001-7000-0001-000000000002',
    '019ba8f8-66e0-73bd-834e-72b47e90507f',
    'Sữa chua Hy Lạp granola',
    'Sữa chua Hy Lạp không đường với granola homemade và việt quất tươi. Giàu protein.',
    NULL,
    200, 'g', 280,
    18, 32, 8, 4, 12, 65,
    'user', true, 23, 1, 45,
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days'
),
-- Preset 3: Avocado toast
(
    '019be001-0001-7000-0001-000000000003',
    '019ba8f8-66e0-73bd-834e-72b47e90507f',
    'Bánh mì bơ trứng',
    'Bánh mì nguyên cám nướng với bơ nghiền, trứng ốp la và hạt chia. Bữa sáng đầy đủ dinh dưỡng.',
    NULL,
    180, 'g', 385,
    15, 28, 24, 9, 2, 320,
    'user', true, 31, 3, 52,
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day'
),
-- Preset 4: Green smoothie
(
    '019be001-0001-7000-0001-000000000004',
    '019ba8f8-66e0-73bd-834e-72b47e90507f',
    'Sinh tố xanh detox',
    'Cải bó xôi, chuối, táo xanh, gừng và nước dừa. Thức uống giải độc buổi sáng.',
    NULL,
    350, 'ml', 185,
    4, 42, 2, 6, 28, 35,
    'user', true, 18, 0, 33,
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days'
),
-- Preset 5: Protein balls (private)
(
    '019be001-0001-7000-0001-000000000005',
    '019ba8f8-66e0-73bd-834e-72b47e90507f',
    'Energy balls hạt điều',
    'Snack năng lượng từ hạt điều, yến mạch, mật ong và cacao. Không cần nướng.',
    NULL,
    40, 'g', 165,
    5, 18, 9, 2, 8, 15,
    'user', false, 0, 0, 12,
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '4 days'
),
-- Preset 6: Chia pudding
(
    '019be001-0001-7000-0001-000000000006',
    '019ba8f8-66e0-73bd-834e-72b47e90507f',
    'Pudding hạt chia xoài',
    'Hạt chia ngâm sữa dừa qua đêm, ăn kèm xoài tươi và dừa nạo. Món tráng miệng healthy.',
    NULL,
    220, 'g', 245,
    6, 28, 12, 10, 14, 25,
    'user', true, 27, 2, 41,
    NOW() - INTERVAL '12 days', NOW() - INTERVAL '1 day'
);

-- User 2: 019bd22a-f48b-724b-9918-09158785e76b
-- Healthy lunch and dinner presets

INSERT INTO meal_plan_schema.food_presets (
    id, creator_id, name, description, image_url,
    serving_size, serving_unit, calories,
    protein, carbohydrates, fat, fiber, sugar, sodium,
    source, is_public, upvote_count, downvote_count, use_count,
    created_at, updated_at
) VALUES
-- Preset 1: Grilled chicken salad
(
    '019be002-0001-7000-0001-000000000001',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Salad ức gà nướng',
    'Ức gà nướng với rau xà lách, cà chua bi, dưa leo, olive và sốt dầu giấm. Bữa trưa low carb.',
    NULL,
    350, 'g', 380,
    42, 12, 18, 4, 6, 480,
    'user', true, 45, 4, 78,
    NOW() - INTERVAL '28 days', NOW() - INTERVAL '2 days'
),
-- Preset 2: Salmon with quinoa
(
    '019be002-0001-7000-0001-000000000002',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Cá hồi áp chảo quinoa',
    'Cá hồi Na Uy áp chảo ăn kèm quinoa và rau củ hấp. Giàu omega-3 và protein.',
    NULL,
    400, 'g', 520,
    38, 35, 24, 6, 3, 420,
    'user', true, 52, 2, 65,
    NOW() - INTERVAL '24 days', NOW() - INTERVAL '1 day'
),
-- Preset 3: Buddha bowl
(
    '019be002-0001-7000-0001-000000000003',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Buddha bowl chay',
    'Gạo lứt, đậu gà, bí đỏ nướng, cải kale, hummus và hạt bí. Bữa ăn thuần chay đầy đủ.',
    NULL,
    450, 'g', 485,
    18, 62, 18, 14, 8, 380,
    'user', true, 38, 1, 54,
    NOW() - INTERVAL '22 days', NOW() - INTERVAL '3 days'
),
-- Preset 4: Beef stir-fry
(
    '019be002-0001-7000-0001-000000000004',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Bò xào rau củ',
    'Thịt bò thăn xào với bông cải xanh, ớt chuông, nấm và sốt teriyaki ít đường.',
    NULL,
    380, 'g', 420,
    35, 22, 22, 5, 8, 680,
    'user', true, 29, 3, 47,
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days'
),
-- Preset 5: Shrimp lettuce wraps
(
    '019be002-0001-7000-0001-000000000005',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Cuốn xà lách tôm',
    'Tôm xào tỏi cuốn trong lá xà lách với bún, rau thơm và nước chấm chua ngọt.',
    NULL,
    280, 'g', 295,
    28, 18, 12, 3, 6, 520,
    'user', true, 33, 2, 42,
    NOW() - INTERVAL '14 days', NOW() - INTERVAL '1 day'
),
-- Preset 6: Tofu steak (private)
(
    '019be002-0001-7000-0001-000000000006',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Steak đậu hũ nấm',
    'Đậu hũ cứng áp chảo với nấm đùi gà và sốt tiêu đen. Món chay giàu protein.',
    NULL,
    320, 'g', 340,
    24, 18, 20, 4, 4, 450,
    'user', false, 0, 0, 18,
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days'
),
-- Preset 7: Poke bowl
(
    '019be002-0001-7000-0001-000000000007',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Poke bowl cá ngừ',
    'Cơm giấm Nhật, cá ngừ tươi, bơ, edamame, rong biển và sốt mè rang.',
    NULL,
    420, 'g', 510,
    32, 52, 18, 6, 8, 620,
    'user', true, 41, 1, 58,
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day'
),
-- Preset 8: Egg white omelette
(
    '019be002-0001-7000-0001-000000000008',
    '019bd22a-f48b-724b-9918-09158785e76b',
    'Omelette lòng trắng rau củ',
    'Omelette từ lòng trắng trứng với rau bina, nấm, cà chua và phô mai ít béo.',
    NULL,
    200, 'g', 185,
    22, 8, 8, 2, 4, 380,
    'user', true, 19, 0, 35,
    NOW() - INTERVAL '5 days', NOW()
);

-- ============================================================================
-- SEED DATA: Preset Reactions (Votes)
-- Sample votes from other users
-- ============================================================================

-- We'll use a few dummy user IDs for reactions
-- These simulate other users voting on the presets

-- Votes for User 1's presets (from User 2)
INSERT INTO meal_plan_schema.preset_reactions (id, preset_id, user_id, vote_type, created_at, updated_at) VALUES
(gen_random_uuid(), '019be001-0001-7000-0001-000000000001', '019bd22a-f48b-724b-9918-09158785e76b', 'up', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
(gen_random_uuid(), '019be001-0001-7000-0001-000000000002', '019bd22a-f48b-724b-9918-09158785e76b', 'up', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), '019be001-0001-7000-0001-000000000003', '019bd22a-f48b-724b-9918-09158785e76b', 'up', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- Votes for User 2's presets (from User 1)
INSERT INTO meal_plan_schema.preset_reactions (id, preset_id, user_id, vote_type, created_at, updated_at) VALUES
(gen_random_uuid(), '019be002-0001-7000-0001-000000000001', '019ba8f8-66e0-73bd-834e-72b47e90507f', 'up', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
(gen_random_uuid(), '019be002-0001-7000-0001-000000000002', '019ba8f8-66e0-73bd-834e-72b47e90507f', 'up', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
(gen_random_uuid(), '019be002-0001-7000-0001-000000000007', '019ba8f8-66e0-73bd-834e-72b47e90507f', 'up', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Food Presets Created:' AS info, COUNT(*) AS count
FROM meal_plan_schema.food_presets
WHERE creator_id IN ('019ba8f8-66e0-73bd-834e-72b47e90507f', '019bd22a-f48b-724b-9918-09158785e76b');

SELECT
    creator_id,
    COUNT(*) AS preset_count,
    SUM(upvote_count) AS total_likes,
    SUM(downvote_count) AS total_dislikes,
    COUNT(*) FILTER (WHERE is_public = true) AS public_presets
FROM meal_plan_schema.food_presets
WHERE creator_id IN ('019ba8f8-66e0-73bd-834e-72b47e90507f', '019bd22a-f48b-724b-9918-09158785e76b')
GROUP BY creator_id;
