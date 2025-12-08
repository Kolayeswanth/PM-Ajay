-- Create Support Tickets table in Supabase

CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    priority TEXT DEFAULT 'Medium',
    message TEXT NOT NULL,
    user_id TEXT,
    user_role TEXT DEFAULT 'contractor',
    user_name TEXT,
    user_email TEXT,
    status TEXT DEFAULT 'Open',
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Add RLS policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own tickets
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT
    USING (true);

-- Policy: Admins can update tickets
CREATE POLICY "Admins can update tickets" ON support_tickets
    FOR UPDATE
    USING (true);


-- Add comments for documentation
COMMENT ON TABLE support_tickets IS 'Stores support tickets from contractors and other users';
COMMENT ON COLUMN support_tickets.subject IS 'Brief subject/title of the issue';
COMMENT ON COLUMN support_tickets.category IS 'Issue category: Payment Issue, Site Issue, Material Shortage, etc.';
COMMENT ON COLUMN support_tickets.priority IS 'Priority level: Low, Medium, High';
COMMENT ON COLUMN support_tickets.message IS 'Detailed description of the issue';
COMMENT ON COLUMN support_tickets.status IS 'Ticket status: Open, In Progress, Resolved, Closed';
COMMENT ON COLUMN support_tickets.admin_response IS 'Response from admin/department';
