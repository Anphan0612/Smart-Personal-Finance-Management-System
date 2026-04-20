-- Migration: Add icon_name column to categories table
-- Date: 2026-04-15
-- Purpose: Support icon display for categories in mobile app

-- Add icon_name column if it doesn't exist
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon_name VARCHAR(50) DEFAULT 'LIST';

-- Update existing categories with default icon names
UPDATE categories SET icon_name = 'PAYMENTS' WHERE id = 'cat-inc-001' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'WORK' WHERE id = 'cat-inc-002' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'ANALYTICS' WHERE id = 'cat-inc-003' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'RESTAURANT' WHERE id = 'cat-exp-001' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'HOME' WHERE id = 'cat-exp-002' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'SHOPPING_BAG' WHERE id = 'cat-exp-003' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'DIRECTIONS_CAR' WHERE id = 'cat-exp-004' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'GROCERY' WHERE id = 'cat-exp-005' AND icon_name IS NULL;
UPDATE categories SET icon_name = 'CELEBRATION' WHERE id = 'cat-exp-006' AND icon_name IS NULL;
