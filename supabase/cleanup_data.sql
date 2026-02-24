-- ========================================
-- CLEANUP DATA SCRIPT
-- ========================================
-- This script deletes all data from the database
-- while preserving user profiles and authentication data
-- 
-- CAUTION: This will permanently delete all challenges,
-- submissions, and transactions!

-- Disable foreign key constraints temporarily
ALTER TABLE submissions DISABLE TRIGGER ALL;
ALTER TABLE transactions DISABLE TRIGGER ALL;
ALTER TABLE challenges DISABLE TRIGGER ALL;

-- Delete all submissions
DELETE FROM submissions;

-- Delete all transactions
DELETE FROM transactions;

-- Delete all challenges
DELETE FROM challenges;

-- Re-enable foreign key constraints
ALTER TABLE submissions ENABLE TRIGGER ALL;
ALTER TABLE transactions ENABLE TRIGGER ALL;
ALTER TABLE challenges ENABLE TRIGGER ALL;

-- Reset coins and points for all users
UPDATE profiles 
SET coins_total = 0, points_total = 0;

-- Verify the cleanup (these should return 0)
SELECT COUNT(*) as submissions_count FROM submissions;
SELECT COUNT(*) as transactions_count FROM transactions;
SELECT COUNT(*) as challenges_count FROM challenges;

-- Show remaining profiles
SELECT id, user_id, role, full_name, coins_total, points_total 
FROM profiles 
ORDER BY created_at;
