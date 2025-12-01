-- Add columns for District project assignment
ALTER TABLE work_orders
ADD COLUMN implementing_agency_id UUID REFERENCES implementing_agencies(id),
ADD COLUMN deadline DATE,
ADD COLUMN project_fund NUMERIC;

-- Optional: Add index for performance
CREATE INDEX idx_work_orders_implementing_agency_id ON work_orders(implementing_agency_id);
