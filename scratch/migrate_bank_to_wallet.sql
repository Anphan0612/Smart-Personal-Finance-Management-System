-- Migration Script: Move Bank Accounts to Wallets
-- Run this AFTER the backend has started once to ensure new columns are created by Hibernate

-- 1. Transfer Bank Accounts to Wallets
INSERT INTO wallets (id, user_id, name, balance, initial_balance, wallet_type, code, symbol, account_number, bank_name, created_at, updated_at)
SELECT 
    id, 
    user_id, 
    bank_name as name, 
    balance, 
    balance as initial_balance, 
    'BANK' as wallet_type, 
    code, 
    symbol, 
    account_number, 
    bank_name, 
    created_at, 
    updated_at
FROM bank_accounts;

-- 2. Verify and Cleanup (Only run after verification)
-- DROP TABLE bank_accounts;
