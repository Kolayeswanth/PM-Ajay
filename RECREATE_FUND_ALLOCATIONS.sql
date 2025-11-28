-- Drop existing table and recreate with correct schema
DROP TABLE IF EXISTS fund_allocations CASCADE;

-- Create fund_allocations table for Ministry allocations to states
CREATE TABLE fund_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_name TEXT NOT NULL,
    state_code TEXT,
    scheme_components TEXT[], -- Array of components like ['Adarsh Gram', 'GIA', 'Hostel']
    amount_allocated BIGINT NOT NULL, -- Amount in rupees (e.g., 15000000000 for 1500 Cr)
    amount_released BIGINT DEFAULT 0,
    allocation_date DATE NOT NULL,
    officer_id TEXT NOT NULL,
    allocator_name TEXT NOT NULL,
    allocator_role TEXT NOT NULL,
    allocator_phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE fund_allocations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow authenticated users to insert fund allocations" ON fund_allocations;
DROP POLICY IF EXISTS "Allow authenticated users to update fund allocations" ON fund_allocations;

-- Create policy to allow authenticated users to read
CREATE POLICY "Allow authenticated users to read fund allocations"
    ON fund_allocations
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert fund allocations"
    ON fund_allocations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update fund allocations"
    ON fund_allocations
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_fund_allocations_state_name ON fund_allocations(state_name);
CREATE INDEX IF NOT EXISTS idx_fund_allocations_allocation_date ON fund_allocations(allocation_date);
CREATE INDEX IF NOT EXISTS idx_fund_allocations_state_code ON fund_allocations(state_code);
