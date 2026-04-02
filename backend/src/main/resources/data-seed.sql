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
-- INCOME Categories
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-inc-001', 'Salary', 'INCOME', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-inc-002', 'Freelance', 'INCOME', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-inc-003', 'Investment', 'INCOME', NOW());

-- EXPENSE Categories
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-exp-001', 'Dining Out', 'EXPENSE', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-exp-002', 'Rent & Utilities', 'EXPENSE', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-exp-003', 'Shopping', 'EXPENSE', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-exp-004', 'Transport', 'EXPENSE', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-exp-005', 'Groceries', 'EXPENSE', NOW());
INSERT INTO categories (id, name, type, created_at) VALUES ('cat-exp-006', 'Entertainment', 'EXPENSE', NOW());

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
