-- SMART MONEY TRACKING - REAL WORLD DATA SEED
-- Database: MySQL/MariaDB

-- 0. BOOTSTRAP CORE TABLES FOR FIRST-RUN CONTAINER INIT
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    user_role INT,
    avatar VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    cccd VARCHAR(255),
    is_enabled BIT(1) NOT NULL,
    preferred_currency VARCHAR(20),
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'LIST',
    nlp_label VARCHAR(50),
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(19,2) NOT NULL,
    initial_balance DECIMAL(19,2) NOT NULL,
    code VARCHAR(20),
    symbol VARCHAR(20),
    wallet_type VARCHAR(20),
    account_number VARCHAR(255),
    bank_name VARCHAR(255),
    branch VARCHAR(255),
    created_at DATETIME,
    updated_at DATETIME,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    wallet_id VARCHAR(36),
    category_id VARCHAR(36),
    transaction_date DATETIME,
    amount DECIMAL(19,2) NOT NULL,
    description VARCHAR(255),
    type VARCHAR(20),
    receipt_image_url VARCHAR(500),
    created_at DATETIME,
    CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id),
    CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 1. DELETE EXISTING DATA (Optional, use with caution)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transactions;
TRUNCATE TABLE categories;
TRUNCATE TABLE wallets;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. SEED USERS (Password: password123 - bcrypt hashed)
INSERT INTO users (id, username, email, password, user_role, is_enabled, created_at, updated_at) 
VALUES ('user-demo-001', 'demo', 'user@atelier.com', '$2a$10$XFMmG3J.IQuG.K2zPImMvuA3H9JjW0B.FhTjU0.eU1U.G1U.G1U.G', 0, 1, NOW(), NOW());

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


-- 4. SEED WALLETS (Including Bank Accounts)
-- Main Wallet
INSERT INTO wallets (id, user_id, name, initial_balance, balance, wallet_type, code, symbol, created_at, updated_at) 
VALUES ('wal-001', 'user-demo-001', 'Cash Wallet', 5000000.00, 5000000.00, 'CASH', 'VND', 'đ', NOW(), NOW());

-- Bank Accounts mapped as Wallets
INSERT INTO wallets (id, user_id, name, initial_balance, balance, wallet_type, bank_name, account_number, code, symbol, created_at, updated_at) 
VALUES ('bank-001', 'user-demo-001', 'MB Bank', 24500000.00, 24500000.00, 'BANK', 'MB Bank', '123456789', 'VND', 'đ', NOW(), NOW());

INSERT INTO wallets (id, user_id, name, initial_balance, balance, wallet_type, bank_name, account_number, code, symbol, created_at, updated_at) 
VALUES ('bank-002', 'user-demo-001', 'Techcombank', 12000000.00, 12000000.00, 'BANK', 'Techcombank', '987654321', 'VND', 'đ', NOW(), NOW());

-- 5. SEED TRANSACTIONS (Simulating a typical month)

-- Income
INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-001', 'wal-001', 'cat-inc-001', 35000000.00, 'INCOME', 'Monthly Salary August', '2026-04-01 08:00:00', NOW());

-- Expenses
INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-002', 'wal-001', 'cat-exp-007', 8000000.00, 'EXPENSE', 'Apartment Rent', '2026-04-02 10:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-003', 'wal-001', 'cat-exp-001', 150000.00, 'EXPENSE', 'Highlands Coffee', '2026-04-02 14:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-004', 'wal-001', 'cat-exp-001', 450000.00, 'EXPENSE', 'Dinner with friends', '2026-04-03 19:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-005', 'wal-001', 'cat-exp-001', 1200000.00, 'EXPENSE', 'Weekly Groceries (Winmart)', '2026-04-05 09:15:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-006', 'wal-001', 'cat-exp-005', 2500000.00, 'EXPENSE', 'Uniqlo Shopping', '2026-04-07 15:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-007', 'wal-001', 'cat-exp-002', 350000.00, 'EXPENSE', 'Grab Car to Office', '2026-04-08 08:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-008', 'wal-001', 'cat-exp-001', 55000.00, 'EXPENSE', 'Bánh mì sáng', '2026-04-10 07:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-009', 'wal-001', 'cat-exp-008', 220000.00, 'EXPENSE', 'Netflix Subscription', '2026-04-12 21:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-010', 'wal-001', 'cat-exp-001', 850000.00, 'EXPENSE', 'Fruit and Snacks', '2026-04-15 17:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-011', 'wal-001', 'cat-exp-001', 200000.00, 'EXPENSE', 'Lunch at office', '2026-04-18 12:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-012', 'wal-001', 'cat-inc-004', 5000000.00, 'INCOME', 'Freelance Project Bonus', '2026-04-20 14:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-013', 'wal-001', 'cat-exp-005', 1200000.00, 'EXPENSE', 'Mechanical Keyboard Keycaps', '2026-04-22 10:00:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-014', 'wal-001', 'cat-exp-002', 50000.00, 'EXPENSE', 'Gasoline', '2026-04-25 08:30:00', NOW());

INSERT INTO transactions (id, wallet_id, category_id, amount, type, description, transaction_date, created_at) 
VALUES ('tx-015', 'wal-001', 'cat-exp-001', 120000.00, 'EXPENSE', 'Starbucks Matcha', '2026-04-28 15:45:00', NOW());

