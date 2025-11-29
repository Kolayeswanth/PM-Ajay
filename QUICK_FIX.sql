-- =====================================================
-- QUICK FIX: Remove old 'name' column
-- This fixes the "null value in column name" error
-- =====================================================

-- Step 1: Add the new columns (if they don't exist)
ALTER TABLE state_assignment 
ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_name VARCHAR(255);

-- Step 2: Remove the old 'name' column that's causing the error
ALTER TABLE state_assignment 
DROP COLUMN IF EXISTS name;

-- Done! Now try adding data through the form.
