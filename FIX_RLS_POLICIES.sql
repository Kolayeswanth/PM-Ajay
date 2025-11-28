-- Fix Row Level Security policies for fund_allocations table
-- This allows both authenticated and anonymous users to perform operations

-- 1. Drop ALL existing policies (both old and new names) to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to read fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow authenticated users to insert fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow authenticated users to update fund allocations" ON fund_allocations;

DROP POLICY IF EXISTS "Allow all users to read fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow all users to insert fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow all users to update fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow all users to delete fund allocations" ON fund_allocations;

-- 2. Create new policies for ALL users (authenticated and anon)

-- Read
CREATE POLICY "Allow all users to read fund allocations"
    ON fund_allocations
    FOR SELECT
    USING (true);

-- Insert
CREATE POLICY "Allow all users to insert fund allocations"
    ON fund_allocations
    FOR INSERT
    WITH CHECK (true);

-- Update
CREATE POLICY "Allow all users to update fund allocations"
    ON fund_allocations
    FOR UPDATE
    USING (true);

-- Delete
CREATE POLICY "Allow all users to delete fund allocations"
    ON fund_allocations
    FOR DELETE
    USING (true);
