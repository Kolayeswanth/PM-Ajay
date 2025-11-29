-- Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    report_type TEXT NOT NULL, -- 'Execution', 'Financial', 'MPR', 'Other'
    reporting_month TEXT,
    reporting_year INTEGER,
    description TEXT,
    submitted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON reports
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON reports
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON reports
    FOR DELETE USING (auth.role() = 'authenticated');
