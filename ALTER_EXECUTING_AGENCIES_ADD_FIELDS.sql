-- Add work_assigned and status columns to executing_agencies table

ALTER TABLE executing_agencies 
ADD COLUMN IF NOT EXISTS work_assigned TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Comment on columns
COMMENT ON COLUMN executing_agencies.work_assigned IS 'Description of the work assigned to the agency';
COMMENT ON COLUMN executing_agencies.status IS 'Status of the agency (Active/Inactive)';
