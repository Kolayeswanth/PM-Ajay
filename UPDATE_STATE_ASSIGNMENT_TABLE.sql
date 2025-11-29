-- =====================================================
-- UPDATE: Add admin_name and state_name columns
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add new columns
ALTER TABLE state_assignment 
ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_name VARCHAR(255);

-- Step 2: If you have existing data with 'name' column, copy it to state_name
UPDATE state_assignment 
SET state_name = name 
WHERE state_name IS NULL AND name IS NOT NULL;

-- Step 3: Drop the old 'name' column (optional - only if you want to remove it)
-- ALTER TABLE state_assignment DROP COLUMN IF EXISTS name;

-- Step 4: Make the new columns NOT NULL (after you've filled them with data)
ALTER TABLE state_assignment 
ALTER COLUMN admin_name SET NOT NULL,
ALTER COLUMN state_name SET NOT NULL;

-- =====================================================
-- Verification Query
-- =====================================================
SELECT * FROM state_assignment LIMIT 5;
