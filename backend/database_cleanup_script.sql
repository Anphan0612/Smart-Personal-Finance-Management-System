-- ============================================================================
-- DATABASE SCHEMA CLEANUP SCRIPT
-- Purpose: Remove redundant camelCase columns after adding @Column annotations
-- Date: 2026-04-15
-- ============================================================================

-- ============================================================================
-- STEP 1: PRE-CLEANUP DATA INTEGRITY CHECK
-- ============================================================================
-- IMPORTANT: Run these queries FIRST to verify duplicate columns contain identical data
-- If ANY query returns rows, DO NOT proceed with cleanup until data is synchronized

-- Check categories table
SELECT id, createdAt, created_at FROM categories WHERE createdAt != created_at LIMIT 10;
SELECT id, iconName, icon_name FROM categories WHERE iconName != icon_name LIMIT 10;

-- Check merchant_preferences table
SELECT id FROM merchant_preferences
WHERE userId != user_id
   OR categoryId != category_id
   OR normalizedPattern != normalized_pattern
   OR lastUsedAt != last_used_at
LIMIT 10;

-- Check transactions table
SELECT id FROM transactions
WHERE walletId != wallet_id
   OR categoryId != category_id
   OR createdAt != created_at
   OR receiptImageUrl != receipt_image_url
LIMIT 10;

-- Check wallets table
SELECT id FROM wallets
WHERE userId != user_id
   OR createdAt != created_at
   OR updatedAt != updated_at
   OR walletType != wallet_type
LIMIT 10;

-- Check budgets table
SELECT id FROM budgets
WHERE month != budget_month
   OR year != budget_year
LIMIT 10;

-- ============================================================================
-- EXPECTED RESULT: All queries above should return 0 rows (empty result)
-- If any query returns data, there is a data inconsistency that MUST be
-- resolved before proceeding with the cleanup script below.
-- ============================================================================


-- ============================================================================
-- STEP 2: BACKUP DATABASE (HIGHLY RECOMMENDED)
-- ============================================================================
-- Run this command in your terminal BEFORE executing the cleanup script:
-- mysqldump -u username -p database_name > backup_before_cleanup_2026-04-15.sql


-- ============================================================================
-- STEP 3: CLEANUP SCRIPT - DROP REDUNDANT COLUMNS
-- ============================================================================
-- This script uses a transaction to ensure atomic operation (all or nothing)
-- If any ALTER TABLE fails, you can rollback the entire transaction

START TRANSACTION;

-- Drop redundant camelCase columns from categories (2 columns)
ALTER TABLE categories DROP COLUMN createdAt;
ALTER TABLE categories DROP COLUMN iconName;

-- Drop redundant camelCase columns from merchant_preferences (4 columns)
ALTER TABLE merchant_preferences DROP COLUMN categoryId;
ALTER TABLE merchant_preferences DROP COLUMN lastUsedAt;
ALTER TABLE merchant_preferences DROP COLUMN normalizedPattern;
ALTER TABLE merchant_preferences DROP COLUMN userId;

-- Drop redundant camelCase columns from transactions (4 columns)
ALTER TABLE transactions DROP COLUMN categoryId;
ALTER TABLE transactions DROP COLUMN createdAt;
ALTER TABLE transactions DROP COLUMN receiptImageUrl;
ALTER TABLE transactions DROP COLUMN walletId;

-- Drop redundant camelCase columns from wallets (4 columns)
ALTER TABLE wallets DROP COLUMN createdAt;
ALTER TABLE wallets DROP COLUMN updatedAt;
ALTER TABLE wallets DROP COLUMN userId;
ALTER TABLE wallets DROP COLUMN walletType;

-- Drop redundant budget columns (2 columns)
ALTER TABLE budgets DROP COLUMN budget_month;
ALTER TABLE budgets DROP COLUMN budget_year;

-- If all commands succeeded, commit the transaction
COMMIT;

-- ============================================================================
-- If any error occurred during execution, run this command to rollback:
-- ROLLBACK;
-- ============================================================================


-- ============================================================================
-- STEP 4: POST-CLEANUP VERIFICATION
-- ============================================================================
-- Verify columns were dropped successfully

SHOW COLUMNS FROM categories;
SHOW COLUMNS FROM merchant_preferences;
SHOW COLUMNS FROM transactions;
SHOW COLUMNS FROM wallets;
SHOW COLUMNS FROM budgets;

-- ============================================================================
-- EXPECTED RESULT:
-- - categories: should have created_at, icon_name (NOT createdAt, iconName)
-- - merchant_preferences: should have user_id, category_id, normalized_pattern, last_used_at
-- - transactions: should have wallet_id, category_id, created_at, receipt_image_url
-- - wallets: should have user_id, created_at, updated_at, wallet_type
-- - budgets: should have month, year (NOT budget_month, budget_year)
-- ============================================================================

-- ============================================================================
-- STEP 5: RESTART APPLICATION
-- ============================================================================
-- After successful cleanup:
-- 1. Restart your Spring Boot application
-- 2. Verify application starts without errors
-- 3. Test key functionality (create transaction, wallet, etc.)
-- 4. Monitor logs for any JPA/Hibernate mapping errors
-- ============================================================================
