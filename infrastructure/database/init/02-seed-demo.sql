-- SMART MONEY TRACKING - REAL WORLD DATA SEED
-- Database: MySQL/MariaDB

-- 1. DELETE EXISTING DATA (Safety redundant with schema drop)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE categories;
TRUNCATE TABLE wallets;
TRUNCATE TABLE budgets;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. SEED USERS (Password: 123456 - bcrypt hashed)
INSERT INTO users (id, username, email, password, user_role, is_enabled, created_at, updated_at) 
VALUES ('user-demo-001', 'demo', 'user@atelier.com', '$2a$12$gWVyvGzRM1keS4.IwYw6POhEYx.d9EH6KU8mXsv6.kd3gfUtyXU56', 0, 1, NOW(), NOW());

-- 3. SEED CATEGORIES
-- INCOME Categories
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-001', 'Salary', 'INCOME', 'SALARY', 'PAYMENTS', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-002', 'Gift', 'INCOME', 'GIFT', 'CARD_GIFTCARD', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-003', 'Savings', 'INCOME', 'SAVING', 'SAVINGS', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-004', 'Other Income', 'INCOME', 'OTHER_INCOME', 'MORE_HORIZ', NOW());

-- EXPENSE Categories
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-001', 'Food & Dining', 'EXPENSE', 'FOOD', 'RESTAURANT', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-002', 'Transport', 'EXPENSE', 'TRANSPORT', 'DIRECTIONS_CAR', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-003', 'Utilities', 'EXPENSE', 'UTILITIES', 'BOLT', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-004', 'Education', 'EXPENSE', 'EDUCATION', 'SCHOOL', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-005', 'Shopping', 'EXPENSE', 'SHOPPING', 'SHOPPING_BAG', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-006', 'Healthcare', 'EXPENSE', 'HEALTH', 'HEALTH', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-007', 'Rent & Housing', 'EXPENSE', 'HOUSING', 'HOME', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-008', 'Entertainment', 'EXPENSE', 'ENTERTAINMENT', 'CELEBRATION', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-009', 'Household', 'EXPENSE', 'HOUSEHOLD', 'HOME_REPAIR', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-010', 'Other Expenses', 'EXPENSE', 'OTHER_EXPENSE', 'MORE_HORIZ', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-014', 'Subscription', 'EXPENSE', 'SUBSCRIPTION', 'LIST', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-015', 'Insurance', 'EXPENSE', 'INSURANCE', 'LIST', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-exp-016', 'Charity', 'EXPENSE', 'CHARITY', 'LIST', NOW());

-- 4. SEED WALLETS
INSERT INTO wallets (id, user_id, name, initial_balance, balance, wallet_type, code, symbol, created_at, updated_at) 
VALUES ('wal-001', 'user-demo-001', 'Cash Wallet', 5000000.00, 5000000.00, 'CASH', 'VND', 'đ', NOW(), NOW());

INSERT INTO wallets (id, user_id, name, initial_balance, balance, wallet_type, bank_name, account_number, code, symbol, created_at, updated_at) 
VALUES ('bank-001', 'user-demo-001', 'MB Bank', 24500000.00, 24500000.00, 'BANK', 'MB Bank', '123456789', 'VND', 'đ', NOW(), NOW());

INSERT INTO wallets (id, user_id, name, initial_balance, balance, wallet_type, bank_name, account_number, code, symbol, created_at, updated_at) 
VALUES ('bank-002', 'user-demo-001', 'Techcombank', 12000000.00, 12000000.00, 'BANK', 'Techcombank', '987654321', 'VND', 'đ', NOW(), NOW());

-- 5. SEED TRANSACTIONS
INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-001', 'wal-001', 'cat-inc-001', 35000000.00, 'INCOME', 'Monthly Salary August', '2026-04-01 08:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-002', 'wal-001', 'cat-exp-007', 8000000.00, 'EXPENSE', 'Apartment Rent', '2026-04-02 10:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-003', 'wal-001', 'cat-exp-001', 150000.00, 'EXPENSE', 'Highlands Coffee', '2026-04-02 14:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-004', 'wal-001', 'cat-exp-001', 450000.00, 'EXPENSE', 'Dinner with friends', '2026-04-03 19:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-005', 'wal-001', 'cat-exp-001', 1200000.00, 'EXPENSE', 'Weekly Groceries (Winmart)', '2026-04-05 09:15:00', NOW());

-- 6. SEED BUDGETS
INSERT INTO budgets (id, user_id, category_id, amount, month, year, created_at) VALUES
('b-001', 'user-demo-001', NULL, 30000000.00, 4, 2026, NOW()),
('b-002', 'user-demo-001', 'cat-exp-001', 5000000.00, 4, 2026, NOW());
