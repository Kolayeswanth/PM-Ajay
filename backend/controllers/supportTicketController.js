const { createClient } = require('@supabase/supabase-js');

// Use SUPABASE_KEY (fallback to SUPABASE_SERVICE_KEY for backwards compatibility)
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_URL || !supabaseKey) {
    console.error('⚠️ WARNING: Supabase credentials not found in environment variables');
    console.error('SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
    console.error('SUPABASE_KEY exists:', !!supabaseKey);
}

const supabase = createClient(
    process.env.SUPABASE_URL || '',
    supabaseKey || ''
);

/**
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
    try {
        const {
            subject,
            category,
            priority,
            message,
            userId,
            userRole,
            userName,
            userEmail
        } = req.body;

        // Validation
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required'
            });
        }

        // Insert ticket into database
        const { data, error } = await supabase
            .from('support_tickets')
            .insert([
                {
                    subject,
                    category: category || 'General',
                    priority: priority || 'Medium',
                    message,
                    user_id: userId,
                    user_role: userRole || 'contractor',
                    user_name: userName,
                    user_email: userEmail,
                    status: 'Open',
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating ticket:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create support ticket',
                error: error.message
            });
        }

        console.log(`✅ Support ticket created: #${data.id}`);

        res.json({
            success: true,
            message: 'Support ticket submitted successfully',
            ticket: data
        });
    } catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all tickets for a user
 */
const getUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch tickets',
                error: error.message
            });
        }

        res.json({
            success: true,
            tickets: data
        });
    } catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get all tickets (admin view)
 */
const getAllTickets = async (req, res) => {
    try {
        const { status, category, priority } = req.query;

        let query = supabase
            .from('support_tickets')
            .select('*');

        // Apply filters
        if (status) {
            query = query.eq('status', status);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (priority) {
            query = query.eq('priority', priority);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching all tickets:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch tickets',
                error: error.message
            });
        }

        res.json({
            success: true,
            tickets: data,
            total: data.length
        });
    } catch (error) {
        console.error('Get all tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status, response } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const updateData = {
            status,
            updated_at: new Date().toISOString()
        };

        if (response) {
            updateData.admin_response = response;
            updateData.responded_at = new Date().toISOString();
        }

        if (status === 'Resolved') {
            updateData.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('support_tickets')
            .update(updateData)
            .eq('id', ticketId)
            .select()
            .single();

        if (error) {
            console.error('Error updating ticket:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update ticket',
                error: error.message
            });
        }

        console.log(`✅ Ticket #${ticketId} updated to ${status}`);

        res.json({
            success: true,
            message: 'Ticket updated successfully',
            ticket: data
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get ticket statistics
 */
const getTicketStats = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('status, priority, category');

        if (error) {
            throw error;
        }

        const stats = {
            total: data.length,
            byStatus: {},
            byPriority: {},
            byCategory: {}
        };

        data.forEach(ticket => {
            // Count by status
            stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;

            // Count by priority
            stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;

            //Count by category
            stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
        });

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};

module.exports = {
    createTicket,
    getUserTickets,
    getAllTickets,
    updateTicketStatus,
    getTicketStats
};
