-- Enable Row Level Security (ensure it is enabled)
ALTER TABLE executing_agencies ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to view executing agencies
-- This ensures that Implementing Agencies (and others) can see the full list
CREATE POLICY "Allow authenticated users to view executing agencies"
ON executing_agencies
FOR SELECT
TO authenticated
USING (true);

-- If you want to allow public access (not recommended if sensitive), uncomment below:
-- CREATE POLICY "Allow public to view executing agencies"
-- ON executing_agencies
-- FOR SELECT
-- TO anon
-- USING (true);
