-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role VARCHAR(50) NOT NULL,
    state_name VARCHAR(100),
    district_name VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_role ON notifications(user_role);
CREATE INDEX IF NOT EXISTS idx_notifications_state_name ON notifications(state_name);
CREATE INDEX IF NOT EXISTS idx_notifications_district_name ON notifications(district_name);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Insert some sample notifications for testing
INSERT INTO notifications (user_role, state_name, title, message, type, read) VALUES
('state', 'Maharashtra', '🎉 New Fund Allocation', 'A new fund of ₹50 Crore has been allocated to Maharashtra for the current fiscal year.', 'success', false),
('state', 'Maharashtra', '📋 Proposal Pending', 'You have 3 district proposals pending approval. Please review them at your earliest convenience.', 'warning', false),
('state', 'Maharashtra', '✅ District Admin Added', 'New district administrator has been successfully added for Mumbai district.', 'info', true),
('state', 'Maharashtra', '💰 Fund Release Completed', 'Successfully released ₹10 Crore to Pune district for approved projects.', 'success', true),
('state', 'Karnataka', '🎉 New Fund Allocation', 'A new fund of ₹45 Crore has been allocated to Karnataka for infrastructure development.', 'success', false),
('ministry', NULL, '📊 Monthly Report Due', 'Monthly financial report submission is due by end of this week. Please ensure timely submission.', 'warning', false),
('district', 'Mumbai', '✅ Proposal Approved', 'Your district proposal for community center has been approved by the state admin.', 'success', false),
('district', 'Mumbai', '💸 Fund Received', 'District has received ₹5 Crore from state allocation. You can now proceed with project implementation.', 'success', true);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
