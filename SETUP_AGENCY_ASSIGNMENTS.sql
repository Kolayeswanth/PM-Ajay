-- Setup agency_assignments table
-- This table stores the agencies managed by Implementing Agencies, separate from the login 'executing_agencies' table.

-- 1. Create Table
CREATE TABLE IF NOT EXISTS agency_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    agency_officer TEXT,
    work_assigned TEXT,
    status TEXT DEFAULT 'Active',
    implementing_agency_id UUID REFERENCES auth.users(id)
);

-- 2. Add comments
COMMENT ON TABLE agency_assignments IS 'Stores agencies assigned and managed by Implementing Agencies';
COMMENT ON COLUMN agency_assignments.work_assigned IS 'Description of the work assigned to the agency';
COMMENT ON COLUMN agency_assignments.status IS 'Status of the agency assignment (Active/Inactive)';

-- 3. Enable Row Level Security (RLS)
ALTER TABLE agency_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Policy for Implementing Agencies to view their own assignments
DROP POLICY IF EXISTS "IA view own assignments" ON agency_assignments;
CREATE POLICY "IA view own assignments" ON agency_assignments
    FOR SELECT
    USING (auth.uid() = implementing_agency_id);

-- Policy for Implementing Agencies to insert their own assignments
DROP POLICY IF EXISTS "IA insert own assignments" ON agency_assignments;
CREATE POLICY "IA insert own assignments" ON agency_assignments
    FOR INSERT
    WITH CHECK (auth.uid() = implementing_agency_id);

-- Policy for Implementing Agencies to update their own assignments
DROP POLICY IF EXISTS "IA update own assignments" ON agency_assignments;
CREATE POLICY "IA update own assignments" ON agency_assignments
    FOR UPDATE
    USING (auth.uid() = implementing_agency_id);

-- Policy for Implementing Agencies to delete their own assignments
DROP POLICY IF EXISTS "IA delete own assignments" ON agency_assignments;
CREATE POLICY "IA delete own assignments" ON agency_assignments
    FOR DELETE
    USING (auth.uid() = implementing_agency_id);
