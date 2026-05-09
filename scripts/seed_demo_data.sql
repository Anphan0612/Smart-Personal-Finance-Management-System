-- ==========================================
-- SMART PERSONAL FINANCE MANAGEMENT
-- Demo seed data for 10/05/2026 product demo
-- Database: PostgreSQL
-- ==========================================
-- Mục tiêu:
-- 1) Tạo account demo dùng được ngay
-- 2) Seed 3 ví + 25 giao dịch + 5 budgets khớp PLAN-demo-preparation.md
-- 3) Đảm bảo số dư cuối:
--    - ACB: 27,370,000đ
--    - Tiền mặt: 3,140,000đ
--    - MoMo: 1,317,000đ
-- ==========================================

BEGIN;

-- 1. Cleanup dữ liệu demo cũ theo đúng thứ tự phụ thuộc
DELETE FROM transactions WHERE wallet_id IN (
  'demo-wallet-acb-001',
  'demo-wallet-cash-001',
  'demo-wallet-momo-001'
);
DELETE FROM budgets WHERE user_id = 'demo-user-001';
DELETE FROM wallets WHERE id IN (
  'demo-wallet-acb-001',
  'demo-wallet-cash-001',
  'demo-wallet-momo-001'
);
DELETE FROM users WHERE id = 'demo-user-001';

-- 2. Tạo user demo
-- Password: 123456
-- BCrypt hash lấy từ backend/src/main/resources/data-seed.sql
INSERT INTO users (
  id,
  username,
  email,
  password,
  user_role,
  is_enabled,
  preferred_currency,
  created_at,
  updated_at
) VALUES (
  'demo-user-001',
  'demo',
  'demo@example.com',
  '$2a$12$gWVyvGzRM1keS4.IwYw6POhEYx.d9EH6KU8mXsv6.kd3gfUtyXU56',
  0,
  true,
  'VND',
  NOW(),
  NOW()
);

-- 3. Tạo categories demo riêng để không phụ thuộc seed khác
INSERT INTO categories (id, name, type, icon_name, nlp_label, created_at) VALUES
('demo-cat-income-salary', 'Lương', 'INCOME', 'PAYMENTS', 'SALARY', NOW()),
('demo-cat-income-freelance', 'Freelance', 'INCOME', 'WORK', 'OTHER_INCOME', NOW()),
('demo-cat-income-other', 'Khác', 'INCOME', 'MORE_HORIZ', 'OTHER_INCOME', NOW()),
('demo-cat-exp-food', 'Ăn uống', 'EXPENSE', 'RESTAURANT', 'FOOD', NOW()),
('demo-cat-exp-transport', 'Di chuyển', 'EXPENSE', 'DIRECTIONS_CAR', 'TRANSPORT', NOW()),
('demo-cat-exp-shopping', 'Mua sắm', 'EXPENSE', 'SHOPPING_BAG', 'SHOPPING', NOW()),
('demo-cat-exp-entertainment', 'Giải trí', 'EXPENSE', 'CELEBRATION', 'ENTERTAINMENT', NOW()),
('demo-cat-exp-housing', 'Nhà cửa', 'EXPENSE', 'HOME', 'HOUSING', NOW()),
('demo-cat-exp-utilities', 'Điện nước', 'EXPENSE', 'BOLT', 'UTILITIES', NOW()),
('demo-cat-exp-health', 'Sức khỏe', 'EXPENSE', 'HEALTH_AND_SAFETY', 'HEALTH', NOW());

-- 4. Tạo wallets với initial_balance theo plan và balance cuối đúng số seed
INSERT INTO wallets (
  id,
  user_id,
  name,
  balance,
  initial_balance,
  code,
  symbol,
  wallet_type,
  bank_name,
  account_number,
  created_at,
  updated_at
) VALUES
(
  'demo-wallet-acb-001',
  'demo-user-001',
  'Ngân hàng ACB',
  27370000.00,
  15000000.00,
  'VND',
  'đ',
  'BANK',
  'ACB',
  '0123456789',
  NOW(),
  NOW()
),
(
  'demo-wallet-cash-001',
  'demo-user-001',
  'Tiền mặt',
  3140000.00,
  3200000.00,
  'VND',
  'đ',
  'CASH',
  NULL,
  NULL,
  NOW(),
  NOW()
),
(
  'demo-wallet-momo-001',
  'demo-user-001',
  'MoMo',
  1317000.00,
  1500000.00,
  'VND',
  'đ',
  'EWALLET',
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- 5. Tạo budgets tháng 05/2026 đúng plan
INSERT INTO budgets (
  id,
  user_id,
  category_id,
  amount,
  "month",
  "year",
  created_at,
  updated_at
) VALUES
('demo-budget-total-2026-05', 'demo-user-001', NULL, 10000000.00, 5, 2026, NOW(), NOW()),
('demo-budget-food-2026-05', 'demo-user-001', 'demo-cat-exp-food', 3000000.00, 5, 2026, NOW(), NOW()),
('demo-budget-transport-2026-05', 'demo-user-001', 'demo-cat-exp-transport', 1000000.00, 5, 2026, NOW(), NOW()),
('demo-budget-shopping-2026-05', 'demo-user-001', 'demo-cat-exp-shopping', 2000000.00, 5, 2026, NOW(), NOW()),
('demo-budget-entertainment-2026-05', 'demo-user-001', 'demo-cat-exp-entertainment', 500000.00, 5, 2026, NOW(), NOW());

-- 6. Tạo 25 transactions đúng theo plan
INSERT INTO transactions (
  id,
  wallet_id,
  category_id,
  transaction_date,
  amount,
  description,
  type,
  created_at
) VALUES
-- ACB (12)
('demo-tx-001', 'demo-wallet-acb-001', 'demo-cat-income-salary', '2026-05-01 08:00:00', 18000000.00, 'Lương tháng 5', 'INCOME', NOW()),
('demo-tx-002', 'demo-wallet-acb-001', 'demo-cat-exp-housing', '2026-05-03 09:00:00', 3500000.00, 'Tiền trọ tháng 5', 'EXPENSE', NOW()),
('demo-tx-003', 'demo-wallet-acb-001', 'demo-cat-exp-utilities', '2026-05-05 08:30:00', 800000.00, 'Tiền điện + nước', 'EXPENSE', NOW()),
('demo-tx-004', 'demo-wallet-acb-001', 'demo-cat-exp-transport', '2026-05-07 07:30:00', 500000.00, 'Xăng xe', 'EXPENSE', NOW()),
('demo-tx-005', 'demo-wallet-acb-001', 'demo-cat-exp-shopping', '2026-05-08 10:00:00', 350000.00, 'Đồ dùng học tập', 'EXPENSE', NOW()),
('demo-tx-006', 'demo-wallet-acb-001', 'demo-cat-exp-food', '2026-05-02 19:00:00', 200000.00, 'Ăn ngoài cuối tuần', 'EXPENSE', NOW()),
('demo-tx-007', 'demo-wallet-acb-001', 'demo-cat-exp-entertainment', '2026-05-04 20:00:00', 150000.00, 'Xem phim', 'EXPENSE', NOW()),
('demo-tx-008', 'demo-wallet-acb-001', 'demo-cat-exp-shopping', '2026-05-06 18:00:00', 1200000.00, 'Quần áo mới', 'EXPENSE', NOW()),
('demo-tx-009', 'demo-wallet-acb-001', 'demo-cat-income-freelance', '2026-05-01 13:00:00', 2000000.00, 'Dự án freelance', 'INCOME', NOW()),
('demo-tx-010', 'demo-wallet-acb-001', 'demo-cat-exp-health', '2026-05-03 15:00:00', 450000.00, 'Khám bệnh', 'EXPENSE', NOW()),
('demo-tx-011', 'demo-wallet-acb-001', 'demo-cat-exp-food', '2026-05-05 19:30:00', 300000.00, 'Tiệc sinh nhật bạn', 'EXPENSE', NOW()),
('demo-tx-012', 'demo-wallet-acb-001', 'demo-cat-exp-transport', '2026-05-07 18:15:00', 180000.00, 'Grab đi làm', 'EXPENSE', NOW()),

-- Tiền mặt (8)
('demo-tx-013', 'demo-wallet-cash-001', 'demo-cat-exp-food', '2026-05-01 07:00:00', 45000.00, 'Phở sáng', 'EXPENSE', NOW()),
('demo-tx-014', 'demo-wallet-cash-001', 'demo-cat-exp-food', '2026-05-02 09:00:00', 35000.00, 'Cà phê', 'EXPENSE', NOW()),
('demo-tx-015', 'demo-wallet-cash-001', 'demo-cat-exp-food', '2026-05-03 12:00:00', 55000.00, 'Cơm trưa', 'EXPENSE', NOW()),
('demo-tx-016', 'demo-wallet-cash-001', 'demo-cat-exp-food', '2026-05-04 19:00:00', 120000.00, 'Ăn tối cùng bạn', 'EXPENSE', NOW()),
('demo-tx-017', 'demo-wallet-cash-001', 'demo-cat-exp-food', '2026-05-05 15:00:00', 25000.00, 'Trà sữa', 'EXPENSE', NOW()),
('demo-tx-018', 'demo-wallet-cash-001', 'demo-cat-exp-transport', '2026-05-06 08:00:00', 80000.00, 'Xe ôm', 'EXPENSE', NOW()),
('demo-tx-019', 'demo-wallet-cash-001', 'demo-cat-exp-shopping', '2026-05-07 17:00:00', 200000.00, 'Đồ lặt vặt', 'EXPENSE', NOW()),
('demo-tx-020', 'demo-wallet-cash-001', 'demo-cat-income-other', '2026-05-08 21:00:00', 500000.00, 'Bạn trả tiền', 'INCOME', NOW()),

-- MoMo (5)
('demo-tx-021', 'demo-wallet-momo-001', 'demo-cat-exp-shopping', '2026-05-02 20:30:00', 149000.00, 'Shopee', 'EXPENSE', NOW()),
('demo-tx-022', 'demo-wallet-momo-001', 'demo-cat-exp-entertainment', '2026-05-04 21:00:00', 79000.00, 'Netflix', 'EXPENSE', NOW()),
('demo-tx-023', 'demo-wallet-momo-001', 'demo-cat-exp-food', '2026-05-06 11:45:00', 200000.00, 'Đặt đồ ăn', 'EXPENSE', NOW()),
('demo-tx-024', 'demo-wallet-momo-001', 'demo-cat-exp-food', '2026-05-07 12:15:00', 55000.00, 'GrabFood', 'EXPENSE', NOW()),
('demo-tx-025', 'demo-wallet-momo-001', 'demo-cat-income-other', '2026-05-01 09:15:00', 300000.00, 'Cashback tháng 4', 'INCOME', NOW());

COMMIT;

-- Kỳ vọng sau khi import:
-- 1) Tổng income = 20,800,000đ
-- 2) Tổng expense = 8,673,000đ
-- 3) Tổng số dư 3 ví = 31,827,000đ
-- 4) Budget Mua sắm = 1,899,000 / 2,000,000 = 95%
-- 5) Budget Tổng tháng = 8,673,000 / 10,000,000 = 87%
-- 6) Login demo@example.com / 123456 dùng được ngay
