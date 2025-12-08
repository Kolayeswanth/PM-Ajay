-- Add role and responsibility fields to work_orders table
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS assigned_user_role TEXT,
ADD COLUMN IF NOT EXISTS assigned_user_responsibilities TEXT[],
ADD COLUMN IF NOT EXISTS assigned_user_notes TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_role ON work_orders(assigned_user_role);