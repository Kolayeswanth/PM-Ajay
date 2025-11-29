-- =====================================================
-- SIMPLE FIX: Update state_assignment table structure
-- Run this in Supabase SQL Editor
-- =====================================================

-- Option 1: If you want to keep existing data
-- Step 1: Add new columns (if they don't exist)
ALTER TABLE state_assignment 
ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_name VARCHAR(255);

-- Step 2: Copy existing 'name' data to 'state_name' (if you have old data)
UPDATE state_assignment 
SET state_name = COALESCE(state_name, name, '')
WHERE state_name IS NULL OR state_name = '';

-- Step 3: Set default empty string for admin_name if null
UPDATE state_assignment 
SET admin_name = COALESCE(admin_name, '')
WHERE admin_name IS NULL OR admin_name = '';

-- Step 4: Drop old 'name' column
ALTER TABLE state_assignment DROP COLUMN IF EXISTS name;

-- =====================================================
-- OR Option 2: Fresh start (deletes all data)
-- =====================================================
-- Uncomment these lines if you want to start fresh:

-- DROP TABLE IF EXISTS state_assignment;
-- 
-- CREATE TABLE state_assignment (
--     id BIGSERIAL PRIMARY KEY,
--     admin_name VARCHAR(255) NOT NULL,
--     state_name VARCHAR(255) NOT NULL,
--     phone_no VARCHAR(15) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     bank_account_number VARCHAR(50) NOT NULL,
--     status VARCHAR(20) DEFAULT 'Active',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- =====================================================
-- Verify the table structure
-- =====================================================
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'state_assignment'
ORDER BY ordinal_position;
