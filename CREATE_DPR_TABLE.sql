-- Create DPRs Table
CREATE TABLE IF NOT EXISTS dprs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_title TEXT NOT NULL,
    location TEXT NOT NULL,
    estimated_cost NUMERIC NOT NULL,
    submission_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Submitted', -- 'Draft', 'Submitted', 'Approved', 'Rejected'
    file_name TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dprs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON dprs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON dprs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON dprs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON dprs
    FOR DELETE USING (auth.role() = 'authenticated');
