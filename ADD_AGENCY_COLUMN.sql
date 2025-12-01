-- Add executing_agency_id column to work_orders table
ALTER TABLE work_orders
ADD COLUMN executing_agency_id UUID REFERENCES executing_agencies(id);

-- Optional: Add index for performance
CREATE INDEX idx_work_orders_executing_agency_id ON work_orders(executing_agency_id);
