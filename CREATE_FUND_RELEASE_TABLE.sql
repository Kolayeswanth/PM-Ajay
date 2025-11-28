-- 1. Ensure districts table exists (if not already)
-- This is a basic structure, assuming you might already have it.
CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    state_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the Fund Releases table
CREATE TABLE IF NOT EXISTS fund_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID REFERENCES districts(id),
    component TEXT[], -- Stores array like ['Adarsh Gram', 'GIA']
    amount_rupees NUMERIC,
    amount_cr NUMERIC,
    release_date DATE,
    officer_id TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE fund_releases ENABLE ROW LEVEL SECURITY;

-- 4. Create policies to allow access
-- Allow everyone to read (for now, to ensure dashboards work)
CREATE POLICY "Enable read access for all users" ON fund_releases
    FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON fund_releases
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Insert some sample districts if table is empty (Optional, for testing)
INSERT INTO districts (name, state_code)
SELECT 'Pune', 'MH'
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Pune');

INSERT INTO districts (name, state_code)
SELECT 'Mumbai City', 'MH'
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Mumbai City');

INSERT INTO districts (name, state_code)
SELECT 'Nagpur', 'MH'
WHERE NOT EXISTS (SELECT 1 FROM districts WHERE name = 'Nagpur');
