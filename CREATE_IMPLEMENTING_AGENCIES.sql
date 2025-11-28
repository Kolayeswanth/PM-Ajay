-- 1. Create the Implementing Agencies Table
CREATE TABLE IF NOT EXISTS public.implementing_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_name TEXT NOT NULL,
    agency_type TEXT, -- e.g., 'NGO', 'Govt Dept', 'Private'
    registration_no TEXT,
    address TEXT,
    contact_number TEXT,
    email TEXT UNIQUE NOT NULL,
    state_name TEXT,
    district_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.implementing_agencies ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Policy: Allow users to view their own agency details
CREATE POLICY "Users can view their own agency details"
ON public.implementing_agencies
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow admins (Ministry/State/District) to view all agencies
-- (Assuming they have a role check function or we just allow authenticated for now for simplicity, 
-- but ideally we check public.profiles.role)
CREATE POLICY "Admins can view all agencies"
ON public.implementing_agencies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('centre_admin', 'state_admin', 'district_admin')
  )
);

-- Policy: Allow update of own details
CREATE POLICY "Agencies can update their own details"
ON public.implementing_agencies
FOR UPDATE
USING (auth.uid() = user_id);
