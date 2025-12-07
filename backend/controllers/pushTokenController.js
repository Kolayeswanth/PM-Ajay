const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Register a push token for a user
 * Expects: { userId, pushToken } in body
 */
exports.registerPushToken = async (req, res) => {
    try {
        const { userId, pushToken } = req.body;

        if (!userId || !pushToken) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, pushToken'
            });
        }

        // Update the user's profile with the push token
        const { data, error } = await supabase
            .from('profiles')
            .update({ push_token: pushToken })
            .eq('id', userId)
            .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Push token registered successfully',
            data
        });

    } catch (error) {
        console.error('❌ Error registering push token:', error.message);
        return res.status(500).json({
            success: false,
            error: 'Failed to register push token',
            details: error.message
        });
    }
};
