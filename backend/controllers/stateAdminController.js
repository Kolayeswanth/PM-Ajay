const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get all state admins
exports.getAllStateAdmins = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('state_assignment')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching state admins:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add new state admin
exports.addStateAdmin = async (req, res) => {
    try {
        const {
            admin_name,
            state_name,
            phone_no,
            email,
            bank_account_number
        } = req.body;

        // Validation
        if (!admin_name || !state_name || !phone_no || !email || !bank_account_number) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: admin_name, state_name, phone_no, email, bank_account_number'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phone_no)) {
            return res.status(400).json({
                success: false,
                error: 'Phone number must be 10 digits'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Insert new state admin with Active status by default
        const { data, error } = await supabase
            .from('state_assignment')
            .insert([
                {
                    admin_name,
                    state_name,
                    phone_no,
                    email,
                    bank_account_number,
                    status: 'Active'
                }
            ])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);

            // Check for unique constraint violation (duplicate email)
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists. Please use a different email.'
                });
            }

            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'State admin added successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error adding state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Update state admin
exports.updateStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            admin_name,
            state_name,
            phone_no,
            email,
            bank_account_number
        } = req.body;

        // Validation
        if (!admin_name || !state_name || !phone_no || !email || !bank_account_number) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: admin_name, state_name, phone_no, email, bank_account_number'
            });
        }

        // Validate phone number (10 digits)
        if (!/^[0-9]{10}$/.test(phone_no)) {
            return res.status(400).json({
                success: false,
                error: 'Phone number must be 10 digits'
            });
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Update state admin
        const { data, error } = await supabase
            .from('state_assignment')
            .update({
                admin_name,
                state_name,
                phone_no,
                email,
                bank_account_number
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);

            // Check for unique constraint violation (duplicate email)
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists. Please use a different email.'
                });
            }

            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        res.json({
            success: true,
            message: 'State admin updated successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error updating state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Activate state admin (not used since we do hard delete)
exports.activateStateAdmin = async (req, res) => {
    try {
        return res.status(400).json({
            success: false,
            error: 'Cannot activate a deleted admin. Please add them as a new admin instead.'
        });
    } catch (error) {
        console.error('Error activating state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Deactivate state admin (DELETE from database - hard delete)
exports.deactivateStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        // First get the admin details before deleting
        const { data: adminData, error: fetchError } = await supabase
            .from('state_assignment')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !adminData) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        // Now delete the record from database
        const { error } = await supabase
            .from('state_assignment')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.json({
            success: true,
            message: 'State admin deactivated and removed from database successfully',
            data: adminData
        });

    } catch (error) {
        console.error('Error deactivating state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete state admin (same as deactivate - hard delete)
exports.deleteStateAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('state_assignment')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'State admin not found'
            });
        }

        res.json({
            success: true,
            message: 'State admin deleted successfully',
            data: data[0]
        });

    } catch (error) {
        console.error('Error deleting state admin:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
