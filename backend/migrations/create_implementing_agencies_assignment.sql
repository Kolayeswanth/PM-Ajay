-- Create implementing_agencies_assignment table
CREATE TABLE IF NOT EXISTS implementing_agencies_assignment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_name VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    phone_no VARCHAR(15) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    bank_account_number VARCHAR(50) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_implementing_agencies_email ON implementing_agencies_assignment(email);

-- Create index on district for filtering
CREATE INDEX IF NOT EXISTS idx_implementing_agencies_district ON implementing_agencies_assignment(district_name);

-- Create index on status
CREATE INDEX IF NOT EXISTS idx_implementing_agencies_status ON implementing_agencies_assignment(status);

-- Enable RLS (Row Level Security)
ALTER TABLE implementing_agencies_assignment ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users"
ON implementing_agencies_assignment
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow all operations for anon users (for now)
CREATE POLICY "Allow all for anon users"
ON implementing_agencies_assignment
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
