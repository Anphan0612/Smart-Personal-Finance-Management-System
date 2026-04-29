-- Smart Personal Finance Management System
-- Unified MySQL Schema (Based on Developer Seed)

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

CREATE TABLE goals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(19,2) NOT NULL,
    current_amount DECIMAL(19,2) DEFAULT 0,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_insights (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_insight_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS merchant_preferences (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    normalized_pattern VARCHAR(255) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_merchant_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS receipts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500),
    store_name VARCHAR(255),
    total_amount DECIMAL(19,2),
    transaction_date DATETIME,
    status VARCHAR(20) DEFAULT 'PENDING',
    raw_text TEXT,
    confidence DOUBLE,
    category_id VARCHAR(36),
    is_corrected BOOLEAN DEFAULT FALSE,
    correction_reason TEXT,
    is_mapped_from_history BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_wallets_user ON wallets(user_id);
