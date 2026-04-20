-- Migration: Add is_ai_suggested column to transactions table
-- Date: 2026-04-16
-- Purpose: Track which transactions were created/suggested by AI for user confirmation

-- Add is_ai_suggested column
-- Note: If column already exists, this will fail - that's OK, just continue
ALTER TABLE transactions ADD COLUMN is_ai_suggested BOOLEAN DEFAULT FALSE;

-- Update existing transactions to mark them as not AI-suggested
UPDATE transactions SET is_ai_suggested = FALSE WHERE is_ai_suggested IS NULL;

