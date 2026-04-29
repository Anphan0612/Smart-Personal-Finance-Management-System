-- SMART MONEY TRACKING - REAL WORLD DATA SEED
-- Database: MySQL/MariaDB

-- 0. CLEANUP (Ensures schema updates apply during development)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS ai_insights;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS merchant_preferences;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. BOOTSTRAP CORE TABLES
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    user_role INT,
    avatar VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    cccd VARCHAR(255),
    is_enabled BIT(1) NOT NULL DEFAULT 1,
    preferred_currency VARCHAR(20) DEFAULT 'VND',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon_name VARCHAR(50) NOT NULL DEFAULT 'LIST',
    nlp_label VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(19,2) NOT NULL DEFAULT 0,
    initial_balance DECIMAL(19,2) NOT NULL DEFAULT 0,
    code VARCHAR(20) DEFAULT 'VND',
    symbol VARCHAR(20) DEFAULT 'đ',
    wallet_type VARCHAR(20),
    account_number VARCHAR(255),
    bank_name VARCHAR(255),
    branch VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id VARCHAR(36) PRIMARY KEY,
    wallet_id VARCHAR(36),
    category_id VARCHAR(36),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(19,2) NOT NULL,
    description VARCHAR(255),
    type VARCHAR(20),
    receipt_image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE budgets (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    amount DECIMAL(19,2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budget_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 2. SEED USERS (Password: 123456 - bcrypt hashed)
INSERT INTO users (id, username, email, password, user_role, is_enabled, created_at, updated_at) 
VALUES ('user-demo-001', 'demo', 'user@atelier.com', '$2a$12$gWVyvGzRM1keS4.IwYw6POhEYx.d9EH6KU8mXsv6.kd3gfUtyXU56', 0, 1, NOW(), NOW());

-- 3. SEED CATEGORIES
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-001', 'Salary', 'INCOME', 'SALARY', 'PAYMENTS', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-002', 'Gift', 'INCOME', 'GIFT', 'CARD_GIFTCARD', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-003', 'Savings', 'INCOME', 'SAVING', 'SAVINGS', NOW());
INSERT INTO categories (id, name, type, nlp_label, icon_name, created_at) VALUES ('cat-inc-004', 'Other Income', 'INCOME', 'OTHER_INCOME', 'MORE_HORIZ', NOW());

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
