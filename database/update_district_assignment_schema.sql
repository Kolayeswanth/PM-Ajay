-- Add state_name column to district_assignment table
ALTER TABLE district_assignment 
ADD COLUMN IF NOT EXISTS state_name text;

-- Optional: Update existing records if possible (this might need manual intervention or complex logic)
-- For now, we just add the column. New records will have it.
-- Old records will have NULL state_name and might not show up in filtered lists immediately.
