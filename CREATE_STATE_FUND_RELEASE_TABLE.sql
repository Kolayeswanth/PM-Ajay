-- 1. Create States Table
CREATE TABLE IF NOT EXISTS states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE, -- e.g., 'MH', 'KA'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create State Fund Releases Table (Ministry -> State)
CREATE TABLE IF NOT EXISTS state_fund_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state_id UUID REFERENCES states(id), -- Foreign Key linking to states table
    component TEXT[], -- ['Adarsh Gram', 'GIA', 'Hostel']
    amount_rupees NUMERIC,
    amount_cr NUMERIC,
    release_date DATE,
    sanction_order_no TEXT, -- Important for Ministry
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- Ministry Admin ID
);

-- 3. Enable Security
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_fund_releases ENABLE ROW LEVEL SECURITY;

-- 4. Create Access Policies
CREATE POLICY "Allow all access to states" ON states FOR ALL USING (true);
CREATE POLICY "Allow all access to state_fund_releases" ON state_fund_releases FOR ALL USING (true);

-- 5. Insert All States
INSERT INTO states (name, code) VALUES
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CG'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OD'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TS'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Andaman and Nicobar Islands', 'AN'),
('Chandigarh', 'CH'),
('Dadra and Nagar Haveli and Daman and Diu', 'DN'),
('Delhi', 'DL'),
('Jammu and Kashmir', 'JK'),
('Ladakh', 'LA'),
('Lakshadweep', 'LD'),
('Puducherry', 'PY')
ON CONFLICT (name) DO NOTHING; -- Prevent duplicates if run multiple times
