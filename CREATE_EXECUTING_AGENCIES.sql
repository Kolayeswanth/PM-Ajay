-- 1. Update Profiles Constraint to include 'executing_agency'
-- We drop the existing constraint and add a new one with the updated list of roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
    'centre_admin', 
    'state_admin', 
    'district_admin', 
    'gp_admin', 
    'department_admin', 
    'contractor', 
    'implementing_agency', 
    'executing_agency', -- Added new role
    'public'
));

-- 2. Create the Executing Agencies Table
CREATE TABLE IF NOT EXISTS public.executing_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    agency_type TEXT, -- e.g., 'Panchayat', 'Block Office', 'Line Dept'
    registration_no TEXT,
    address TEXT,
    contact_number TEXT,
    email TEXT UNIQUE NOT NULL,
    state_name TEXT,
    district_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE public.executing_agencies ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Policy: Allow users to view their own agency details
CREATE POLICY "Users can view their own executing agency details"
ON public.executing_agencies
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow admins to view all agencies
CREATE POLICY "Admins can view all executing agencies"
ON public.executing_agencies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('centre_admin', 'state_admin', 'district_admin')
  )
);

-- Policy: Allow update of own details
CREATE POLICY "Executing Agencies can update their own details"
ON public.executing_agencies
FOR UPDATE
USING (auth.uid() = user_id);
