-- Recreate the master table for implementing agencies with the correct column name
DROP TABLE IF EXISTS implementing_agencies;

CREATE TABLE implementing_agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE implementing_agencies ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to everyone
CREATE POLICY "Allow public read access" ON implementing_agencies
    FOR SELECT USING (true);

-- Insert the new master list of agencies
INSERT INTO implementing_agencies (agency_name) VALUES
('GOV - Tamil Nadu'),
('GOV - Madhya Pradesh'),
('GOV - Maharashtra'),
('GOV - Rajasthan'),
('GOV - Uttar Pradesh'),
('GOV - Gujarat'),
('GOV - West Bengal'),
('NGO - Maharashtra'),
('NGO - Rajasthan'),
('NGO - Karnataka'),
('NGO - Uttar Pradesh'),
('NGO - Madhya Pradesh'),
('PSU - Uttar Pradesh'),
('PSU - Gujarat'),
('PSU - Bihar'),
('PSU - Maharashtra'),
('PSU - Tamil Nadu'),
('PSU - Karnataka'),
('PSU - West Bengal'),
('TEC - Tamil Nadu'),
('TEC - Maharashtra'),
('TEC - Karnataka'),
('TEC - Bihar'),
('TEC - West Bengal'),
('STA - Karnataka'),
('STA - Maharashtra'),
('STA - Gujarat'),
('STA - Bihar'),
('STA - Rajasthan'),
('NOD - Maharashtra'),
('NOD - Karnataka'),
('NOD - West Bengal'),
('NOD - Uttar Pradesh'),
('NOD - Madhya Pradesh'),
('NOD - Bihar'),
('COO - Bihar'),
('COO - Maharashtra'),
('COO - Madhya Pradesh'),
('COO - Delhi'),
('Ministry of Tribal Affairs'),
('Ministry of Social Justice and Empowerment'),
('State Scheduled Caste Corporation'),
('National Backward Classes Finance Corporation'),
('Tribal Cooperative Marketing Development Federation'),
('State Social Welfare Department'),
('District Collector Office'),
('National Minorities Development Corporation');
