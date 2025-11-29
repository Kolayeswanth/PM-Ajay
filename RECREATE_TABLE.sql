-- =====================================================
-- COMPLETE FIX: Recreate state_assignment table
-- This will DELETE all existing data and create fresh
-- =====================================================

-- Step 1: Drop the existing table
DROP TABLE IF EXISTS state_assignment CASCADE;

-- Step 2: Create the table with correct structure
CREATE TABLE state_assignment (
    id BIGSERIAL PRIMARY KEY,
    admin_name VARCHAR(255) NOT NULL,
    state_name VARCHAR(255) NOT NULL,
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    bank_account_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Verify the table was created correctly
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'state_assignment'
ORDER BY ordinal_position;

-- You should see these columns:
-- id, admin_name, state_name, phone_no, email, bank_account_number, status, created_at, updated_at
