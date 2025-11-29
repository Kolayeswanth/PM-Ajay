-- Setup executing_agencies table
-- This script will create the table if it doesn't exist and add necessary columns

-- 1. Create Table if not exists (Basic structure)
CREATE TABLE IF NOT EXISTS executing_agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add ALL columns (safe to run even if columns exist)
ALTER TABLE executing_agencies 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS implementing_agency_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Executing Agency',
ADD COLUMN IF NOT EXISTS component TEXT DEFAULT 'Infrastructure',
ADD COLUMN IF NOT EXISTS work_assigned TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS agency_officer TEXT;

-- 3. Add comments
COMMENT ON TABLE executing_agencies IS 'Stores information about Executing Agencies managed by Implementing Agencies';
COMMENT ON COLUMN executing_agencies.work_assigned IS 'Description of the work assigned to the agency';
COMMENT ON COLUMN executing_agencies.status IS 'Status of the agency (Active/Inactive)';
COMMENT ON COLUMN executing_agencies.agency_officer IS 'Name of the officer in charge of the agency';

-- 4. Enable Row Level Security (RLS)
ALTER TABLE executing_agencies ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Drop existing first to avoid errors or use DO block)
-- We use a DO block to safely create policies only if they don't exist is complex in raw SQL without plpgsql.
-- Simpler approach: Drop and Recreate (Safe if no other dependencies)

DROP POLICY IF EXISTS "IA view own agencies" ON executing_agencies;
CREATE POLICY "IA view own agencies" ON executing_agencies
    FOR SELECT
    USING (auth.uid() = implementing_agency_id);

DROP POLICY IF EXISTS "IA insert own agencies" ON executing_agencies;
CREATE POLICY "IA insert own agencies" ON executing_agencies
    FOR INSERT
    WITH CHECK (auth.uid() = implementing_agency_id);

DROP POLICY IF EXISTS "IA update own agencies" ON executing_agencies;
CREATE POLICY "IA update own agencies" ON executing_agencies
    FOR UPDATE
    USING (auth.uid() = implementing_agency_id);

DROP POLICY IF EXISTS "IA delete own agencies" ON executing_agencies;
CREATE POLICY "IA delete own agencies" ON executing_agencies
    FOR DELETE
    USING (auth.uid() = implementing_agency_id);
