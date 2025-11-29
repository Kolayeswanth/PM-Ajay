-- COMPLETE DATABASE SETUP SCRIPT
-- Run this in Supabase SQL Editor to set up the ENTIRE project from scratch.

-- 1. Create PROFILES Table (Links to Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('ministry_admin', 'state_admin', 'district_admin', 'gram_panchayat', 'implementing_agency')),
    state_code TEXT,
    district_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Create STATES Table
CREATE TABLE IF NOT EXISTS states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create DISTRICTS Table
CREATE TABLE IF NOT EXISTS districts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    state_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create MINISTRY -> STATE Fund Releases Table
CREATE TABLE IF NOT EXISTS state_fund_releases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state_id UUID REFERENCES states(id),
    component TEXT[],
    amount_rupees NUMERIC,
    amount_cr NUMERIC,
    release_date DATE,
    sanction_order_no TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- 5. Create STATE -> DISTRICT Fund Releases Table
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
    created_by UUID
);

-- 6. Enable RLS for all tables
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_fund_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fund_releases ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies (Open access for testing)
CREATE POLICY "Allow all access to states" ON states FOR ALL USING (true);
CREATE POLICY "Allow all access to districts" ON districts FOR ALL USING (true);
CREATE POLICY "Allow all access to state_fund_releases" ON state_fund_releases FOR ALL USING (true);
CREATE POLICY "Allow all access to fund_releases" ON fund_releases FOR ALL USING (true);

-- 8. Insert STATES Data
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

-- 9. Insert Sample DISTRICTS Data
INSERT INTO districts (name, state_code) VALUES 
('Pune', 'MH'), ('Mumbai City', 'MH'), ('Nagpur', 'MH'),
('Nicobar', 'AN'), ('North and Middle Andaman', 'AN'), ('South Andaman', 'AN'),
('Bangalore Urban', 'KA'), ('Mysore', 'KA')
ON CONFLICT DO NOTHING;

-- 10. Setup Trigger for New User Creation (Auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (new.id, new.email, 'ministry_admin', 'New User');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Optional) Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
