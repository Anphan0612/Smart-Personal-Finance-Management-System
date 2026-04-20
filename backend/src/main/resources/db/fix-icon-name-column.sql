-- Fix icon_name column type from ENUM to VARCHAR
-- This allows any MaterialSymbol enum value to be stored

ALTER TABLE categories
MODIFY COLUMN icon_name VARCHAR(50) DEFAULT 'LIST';
