-- Migration: Update work_orders table schema
-- Add missing columns to support tracking of assigned projects

-- Add executing_agency_name
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS executing_agency_name TEXT;

-- Add executing_agency_email
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS executing_agency_email TEXT;

-- Add progress_percentage
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC DEFAULT 0;

-- Add component
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS component TEXT;

-- Add assigned_at timestamp
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_orders_executing_agency_id 
ON work_orders(executing_agency_id);

CREATE INDEX IF NOT EXISTS idx_work_orders_implementing_agency_id 
ON work_orders(implementing_agency_id);

-- Comment on table
COMMENT ON TABLE work_orders IS 'Tracks projects assigned to executing agencies and their progress';
