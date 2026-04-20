-- Migration: Add color column and update nlp_label for category mapping sync
-- Date: 2026-04-16
-- Purpose: Synchronize category mapping between AI, Backend, and Frontend

-- Step 1: Add color column to categories table
-- Note: If column already exists, this will fail - that's OK, just continue with next steps
ALTER TABLE categories ADD COLUMN color VARCHAR(7);

-- Step 2: Update nlp_label for better AI categorization
-- Distinguish between DINING_OUT (eating out) and GROCERIES_FOOD (grocery shopping)
UPDATE categories SET nlp_label = 'DINING_OUT' WHERE id = 'cat-exp-001';
UPDATE categories SET nlp_label = 'GROCERIES_FOOD' WHERE id = 'cat-exp-005';

-- Step 3: Add unique constraint to nlp_label to prevent lookup conflicts
-- Note: If constraint already exists, this will fail - that's OK
ALTER TABLE categories ADD CONSTRAINT unique_nlp_label UNIQUE (nlp_label);

-- Step 4: Assign standard color palette to existing categories
-- Income categories (Green tones)
UPDATE categories SET color = '#2ECC71' WHERE id = 'cat-inc-001'; -- Salary
UPDATE categories SET color = '#27AE60' WHERE id = 'cat-inc-002'; -- Freelance
UPDATE categories SET color = '#16A085' WHERE id = 'cat-inc-003'; -- Investment
UPDATE categories SET color = '#1ABC9C' WHERE id = 'cat-inc-004'; -- Gift
UPDATE categories SET color = '#95A5A6' WHERE id = 'cat-inc-005'; -- Other Income

-- Expense categories (Varied palette for visual distinction)
UPDATE categories SET color = '#E67E22' WHERE id = 'cat-exp-001'; -- Dining Out (Orange)
UPDATE categories SET color = '#3498DB' WHERE id = 'cat-exp-002'; -- Rent & Utilities (Blue)
UPDATE categories SET color = '#9B59B6' WHERE id = 'cat-exp-003'; -- Shopping (Purple)
UPDATE categories SET color = '#34495E' WHERE id = 'cat-exp-004'; -- Transport (Dark Gray)
UPDATE categories SET color = '#FF5733' WHERE id = 'cat-exp-005'; -- Groceries (Red-Orange)
UPDATE categories SET color = '#F39C12' WHERE id = 'cat-exp-006'; -- Entertainment (Yellow-Orange)
UPDATE categories SET color = '#E74C3C' WHERE id = 'cat-exp-007'; -- Healthcare (Red)
UPDATE categories SET color = '#1F618D' WHERE id = 'cat-exp-008'; -- Education (Dark Blue)
UPDATE categories SET color = '#F1C40F' WHERE id = 'cat-exp-009'; -- Utilities (Yellow)
UPDATE categories SET color = '#8E44AD' WHERE id = 'cat-exp-010'; -- Household (Purple)
UPDATE categories SET color = '#D35400' WHERE id = 'cat-exp-011'; -- Food & Dining (Dark Orange)
UPDATE categories SET color = '#7F8C8D' WHERE id = 'cat-exp-012'; -- Other Expenses (Gray)
UPDATE categories SET color = '#16A085' WHERE id = 'cat-exp-013'; -- Savings (Teal)

-- Step 5: Insert new modern expense categories
-- Using INSERT IGNORE to skip if already exists
INSERT IGNORE INTO categories (id, name, type, nlp_label, icon_name, color, created_at)
VALUES
    ('cat-exp-014', 'Subscription', 'EXPENSE', 'SUBSCRIPTION', 'SUBSCRIPTIONS', '#607D8B', NOW()),
    ('cat-exp-015', 'Insurance', 'EXPENSE', 'INSURANCE', 'SHIELD', '#5D4037', NOW()),
    ('cat-exp-016', 'Charity', 'EXPENSE', 'CHARITY', 'VOLUNTEER_ACTIVISM', '#E91E63', NOW());

