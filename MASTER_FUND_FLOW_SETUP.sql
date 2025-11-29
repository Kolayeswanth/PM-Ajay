-- MASTER SCRIPT: PM-AJAY Fund Flow Setup
-- Run this in Supabase SQL Editor to set up all tables for Ministry -> State -> District fund flow.

-- ==========================================
-- 1. STATES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE, -- e.g., 'MH', 'KA'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert States (if not exist)
INSERT INTO states (name, code) VALUES
('Andhra Pradesh', 'AP'), ('Arunachal Pradesh', 'AR'), ('Assam', 'AS'), ('Bihar', 'BR'), ('Chhattisgarh', 'CG'),
('Goa', 'GA'), ('Gujarat', 'GJ'), ('Haryana', 'HR'), ('Himachal Pradesh', 'HP'), ('Jharkhand', 'JH'),
('Karnataka', 'KA'), ('Kerala', 'KL'), ('Madhya Pradesh', 'MP'), ('Maharashtra', 'MH'), ('Manipur', 'MN'),
('Meghalaya', 'ML'), ('Mizoram', 'MZ'), ('Nagaland', 'NL'), ('Odisha', 'OD'), ('Punjab', 'PB'),
('Rajasthan', 'RJ'), ('Sikkim', 'SK'), ('Tamil Nadu', 'TN'), ('Telangana', 'TS'), ('Tripura', 'TR'),
('Uttar Pradesh', 'UP'), ('Uttarakhand', 'UK'), ('West Bengal', 'WB'), ('Andaman and Nicobar Islands', 'AN'),
('Chandigarh', 'CH'), ('Dadra and Nagar Haveli and Daman and Diu', 'DN'), ('Delhi', 'DL'),
('Jammu and Kashmir', 'JK'), ('Ladakh', 'LA'), ('Lakshadweep', 'LD'), ('Puducherry', 'PY')
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- 2. DISTRICTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    state_code TEXT, -- e.g., 'MH' (Links loosely to states, or could be FK)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Sample Districts (You can add more)
INSERT INTO districts (name, state_code) VALUES 
('Pune', 'MH'), ('Mumbai City', 'MH'), ('Nagpur', 'MH'),
('Nicobar', 'AN'), ('North and Middle Andaman', 'AN'), ('South Andaman', 'AN'),
('Bangalore Urban', 'KA'), ('Mysore', 'KA')
ON CONFLICT DO NOTHING; -- Note: 'name' isn't unique globally, so conflict check is loose here or skipped in real prod

-- ==========================================
-- 3. MINISTRY -> STATE FUND RELEASES
-- ==========================================
CREATE TABLE IF NOT EXISTS state_fund_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state_id UUID REFERENCES states(id),
    component TEXT[], -- ['Adarsh Gram', 'GIA']
    amount_rupees NUMERIC,
    amount_cr NUMERIC,
    release_date DATE,
    sanction_order_no TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- Ministry Admin ID
);

-- ==========================================
-- 4. STATE -> DISTRICT FUND RELEASES
-- ==========================================
CREATE TABLE IF NOT EXISTS fund_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    district_id UUID REFERENCES districts(id),
    component TEXT[],
    amount_rupees NUMERIC,
    amount_cr NUMERIC,
    release_date DATE,
    officer_id TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- State Admin ID
);

-- ==========================================
-- 5. SECURITY POLICIES (RLS)
-- ==========================================
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_fund_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_releases ENABLE ROW LEVEL SECURITY;

-- Allow ALL access (Read/Write) for now to ensure smooth testing
CREATE POLICY "Allow all access to states" ON states FOR ALL USING (true);
CREATE POLICY "Allow all access to districts" ON districts FOR ALL USING (true);
CREATE POLICY "Allow all access to state_fund_releases" ON state_fund_releases FOR ALL USING (true);
CREATE POLICY "Allow all access to fund_releases" ON fund_releases FOR ALL USING (true);

-- ==========================================
-- 6. VERIFICATION QUERY
-- ==========================================
-- Run this to check if tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('states', 'districts', 'state_fund_releases', 'fund_releases');
