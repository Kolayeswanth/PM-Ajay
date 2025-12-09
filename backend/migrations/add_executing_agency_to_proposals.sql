-- Migration: Add executing agency columns to district_proposals
-- This enables tracking which executing agency a project is assigned to

-- Add executing_agency_id column
ALTER TABLE district_proposals 
ADD COLUMN IF NOT EXISTS executing_agency_id UUID;

-- Add executing_agency_name column for quick reference
ALTER TABLE district_proposals 
ADD COLUMN IF NOT EXISTS executing_agency_name TEXT;

-- Add assigned_to_ea_at timestamp
ALTER TABLE district_proposals 
ADD COLUMN IF NOT EXISTS assigned_to_ea_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_district_proposals_executing_agency 
ON district_proposals(executing_agency_id);

CREATE INDEX IF NOT EXISTS idx_district_proposals_status_ea 
ON district_proposals(status) WHERE status = 'ASSIGNED_TO_EA';

-- Comment
COMMENT ON COLUMN district_proposals.executing_agency_id IS 'UUID of the executing agency this project is assigned to';
COMMENT ON COLUMN district_proposals.executing_agency_name IS 'Name of the executing agency for quick reference';
COMMENT ON COLUMN district_proposals.assigned_to_ea_at IS 'Timestamp when the project was assigned to executing agency';
