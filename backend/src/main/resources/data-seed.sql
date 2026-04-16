-- SMART MONEY TRACKING - REAL WORLD DATA SEED
-- Database: MySQL/MariaDB

-- 1. DELETE EXISTING DATA (Optional, use with caution)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE categories;
TRUNCATE TABLE wallets;
TRUNCATE TABLE bank_accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. SEED USERS (Password: password123 - bcrypt hashed)
INSERT INTO users (id, username, email, password, user_role, is_enabled, created_at, updated_at) 
VALUES ('user-demo-001', 'demo', 'user@atelier.com', '$2a$10$XFMmG3J.IQuG.K2zPImMvuA3H9JjW0B.FhTjU0.eU1U.G1U.G1U.G', 0, 1, NOW(), NOW());

-- 3. SEED CATEGORIES
-- Step 1: Insert categories without icon_name (for backward compatibility)
-- INCOME Categories (with color field)
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-inc-001', 'Salary', 'INCOME', 'SALARY', '#2ECC71', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-inc-002', 'Freelance', 'INCOME', 'FREELANCE', '#27AE60', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-inc-003', 'Investment', 'INCOME', 'INVESTMENT', '#16A085', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-inc-004', 'Gift', 'INCOME', 'GIFT', '#1ABC9C', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-inc-005', 'Other Income', 'INCOME', 'OTHER_INCOME', '#95A5A6', NOW());

-- EXPENSE Categories (with color field)
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-001', 'Dining Out', 'EXPENSE', 'DINING_OUT', '#E67E22', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-002', 'Rent & Utilities', 'EXPENSE', 'HOUSING', '#3498DB', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-003', 'Shopping', 'EXPENSE', 'SHOPPING', '#9B59B6', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-004', 'Transport', 'EXPENSE', 'TRANSPORT', '#34495E', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-005', 'Groceries', 'EXPENSE', 'GROCERIES_FOOD', '#FF5733', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-006', 'Entertainment', 'EXPENSE', 'ENTERTAINMENT', '#F39C12', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-007', 'Healthcare', 'EXPENSE', 'HEALTH_CARE', '#E74C3C', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-008', 'Education', 'EXPENSE', 'EDUCATION', '#1F618D', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-009', 'Utilities', 'EXPENSE', 'UTILITIES', '#F1C40F', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-010', 'Household', 'EXPENSE', 'HOUSEHOLD', '#8E44AD', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-011', 'Food & Dining', 'EXPENSE', 'FOOD', '#D35400', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-012', 'Other Expenses', 'EXPENSE', 'OTHER_EXPENSE', '#7F8C8D', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-013', 'Savings', 'EXPENSE', 'SAVING', '#16A085', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-014', 'Subscription', 'EXPENSE', 'SUBSCRIPTION', '#607D8B', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-015', 'Insurance', 'EXPENSE', 'INSURANCE', '#5D4037', NOW());
INSERT INTO categories (id, name, type, nlp_label, color, created_at) VALUES ('cat-exp-016', 'Charity', 'EXPENSE', 'CHARITY', '#E91E63', NOW());

-- Step 2: Update icon_name if column exists (will be created by Hibernate on first run)
UPDATE categories SET icon_name = 'PAYMENTS' WHERE id = 'cat-inc-001';
UPDATE categories SET icon_name = 'WORK' WHERE id = 'cat-inc-002';
UPDATE categories SET icon_name = 'ANALYTICS' WHERE id = 'cat-inc-003';
UPDATE categories SET icon_name = 'CARD_GIFTCARD' WHERE id = 'cat-inc-004';
UPDATE categories SET icon_name = 'MORE_HORIZ' WHERE id = 'cat-inc-005';
UPDATE categories SET icon_name = 'RESTAURANT' WHERE id = 'cat-exp-001';
UPDATE categories SET icon_name = 'HOME' WHERE id = 'cat-exp-002';
UPDATE categories SET icon_name = 'SHOPPING_BAG' WHERE id = 'cat-exp-003';
UPDATE categories SET icon_name = 'DIRECTIONS_CAR' WHERE id = 'cat-exp-004';
UPDATE categories SET icon_name = 'GROCERY' WHERE id = 'cat-exp-005';
UPDATE categories SET icon_name = 'CELEBRATION' WHERE id = 'cat-exp-006';
UPDATE categories SET icon_name = 'HEALTH' WHERE id = 'cat-exp-007';
UPDATE categories SET icon_name = 'SCHOOL' WHERE id = 'cat-exp-008';
UPDATE categories SET icon_name = 'BOLT' WHERE id = 'cat-exp-009';
UPDATE categories SET icon_name = 'HOME_REPAIR' WHERE id = 'cat-exp-010';
UPDATE categories SET icon_name = 'RESTAURANT_MENU' WHERE id = 'cat-exp-011';
UPDATE categories SET icon_name = 'MORE_HORIZ' WHERE id = 'cat-exp-012';
UPDATE categories SET icon_name = 'SAVINGS' WHERE id = 'cat-exp-013';
UPDATE categories SET icon_name = 'SUBSCRIPTIONS' WHERE id = 'cat-exp-014';
UPDATE categories SET icon_name = 'SHIELD' WHERE id = 'cat-exp-015';
UPDATE categories SET icon_name = 'VOLUNTEER_ACTIVISM' WHERE id = 'cat-exp-016';

-- 4. SEED BANK ACCOUNTS & WALLETS
-- Main Wallet
INSERT INTO wallets (id, user_id, name, balance, wallet_type, code, symbol, created_at, updated_at) 
VALUES ('wal-001', 'user-demo-001', 'Cash Wallet', 5000000.00, 'CASH', 'VND', 'đ', NOW(), NOW());

-- Bank Accounts
INSERT INTO bank_accounts (id, user_id, bank_name, account_number, balance, type, code, symbol, created_at, updated_at) 
VALUES ('bank-001', 'user-demo-001', 'MB Bank', '123456789', 24500000.00, 'SAVINGS', 'VND', 'đ', NOW(), NOW());

INSERT INTO bank_accounts (id, user_id, bank_name, account_number, balance, type, code, symbol, created_at, updated_at) 
VALUES ('bank-002', 'user-demo-001', 'Techcombank', '987654321', 12000000.00, 'CURRENT', 'VND', 'đ', NOW(), NOW());

-- 5. SEED TRANSACTIONS (Simulating a typical month)

-- Income
INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-001', 'wal-001', 'cat-inc-001', 35000000.00, 'INCOME', 'Monthly Salary August', '2026-04-01 08:00:00', NOW());

-- Expenses
INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-002', 'wal-001', 'cat-exp-002', 8000000.00, 'EXPENSE', 'Apartment Rent', '2026-04-02 10:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-003', 'wal-001', 'cat-exp-001', 150000.00, 'EXPENSE', 'Highlands Coffee', '2026-04-02 14:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-004', 'wal-001', 'cat-exp-001', 450000.00, 'EXPENSE', 'Dinner with friends', '2026-04-03 19:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-005', 'wal-001', 'cat-exp-005', 1200000.00, 'EXPENSE', 'Weekly Groceries (Winmart)', '2026-04-05 09:15:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-006', 'wal-001', 'cat-exp-003', 2500000.00, 'EXPENSE', 'Uniqlo Shopping', '2026-04-07 15:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-007', 'wal-001', 'cat-exp-004', 350000.00, 'EXPENSE', 'Grab Car to Office', '2026-04-08 08:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-008', 'wal-001', 'cat-exp-001', 55000.00, 'EXPENSE', 'Bánh mì sáng', '2026-04-10 07:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-009', 'wal-001', 'cat-exp-006', 220000.00, 'EXPENSE', 'Netflix Subscription', '2026-04-12 21:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-010', 'wal-001', 'cat-exp-005', 850000.00, 'EXPENSE', 'Fruit and Snacks', '2026-04-15 17:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-011', 'wal-001', 'cat-exp-001', 200000.00, 'EXPENSE', 'Lunch at office', '2026-04-18 12:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-012', 'wal-001', 'cat-inc-002', 5000000.00, 'INCOME', 'Freelance Project Bonus', '2026-04-20 14:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-013', 'wal-001', 'cat-exp-003', 1200000.00, 'EXPENSE', 'Mechanical Keyboard Keycaps', '2026-04-22 10:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-014', 'wal-001', 'cat-exp-004', 50000.00, 'EXPENSE', 'Gasoline', '2026-04-25 08:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-015', 'wal-001', 'cat-exp-001', 120000.00, 'EXPENSE', 'Starbucks Matcha', '2026-04-28 15:45:00', NOW());

