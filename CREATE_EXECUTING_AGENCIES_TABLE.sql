-- Create Executing Agencies Table
CREATE TABLE IF NOT EXISTS executing_agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    component TEXT, -- 'Adarsh Gram', 'GIA', 'Hostel'
    implementing_agency_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE executing_agencies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON executing_agencies
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON executing_agencies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON executing_agencies
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON executing_agencies
    FOR DELETE USING (auth.role() = 'authenticated');
