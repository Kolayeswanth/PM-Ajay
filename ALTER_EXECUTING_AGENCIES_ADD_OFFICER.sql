-- Add agency_officer column to executing_agencies table

ALTER TABLE executing_agencies 
ADD COLUMN IF NOT EXISTS agency_officer TEXT;

-- Comment on column
COMMENT ON COLUMN executing_agencies.agency_officer IS 'Name of the officer in charge of the agency';
