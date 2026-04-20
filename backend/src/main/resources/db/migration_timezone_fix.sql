-- Timezone Migration: Shift historical data by +7 hours
-- This script corrects transactions that were stored as 'Local Time' instead of 'UTC'
-- due to incorrect configuration.

USE smart_money_tracking;

-- 1. Update transactions
-- Note: We only shift if the values look like they were recorded before the fix
UPDATE transactions 
SET transaction_date = DATE_ADD(transaction_date, INTERVAL 7 HOUR)
WHERE transaction_date < '2026-04-13 00:00:00'; -- Limit to before the fix date

-- 2. Update receipts (if applicable)
UPDATE receipts
SET created_at = DATE_ADD(created_at, INTERVAL 7 HOUR)
WHERE created_at < '2026-04-13 00:00:00';
