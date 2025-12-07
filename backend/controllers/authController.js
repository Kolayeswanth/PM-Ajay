// Auth Controller
// Note: Most authentication happens directly on the frontend with Supabase
// This is for server-side admin operations if needed

const supabase = require('../config/supabaseClient');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt received for:', email);

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Supabase auth error:', error.message);
            return res.status(401).json({ error: error.message });
        }

        if (!data.user) {
            return res.status(401).json({ error: 'User not found' });
        }

        console.log('Login successful for:', email);

        // Get user profile including role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
             console.warn('Profile fetch error:', profileError.message);
        }

        res.status(200).json({
            message: 'Login successful',
            token: data.session.access_token,
            user: {
                ...data.user,
                // Add profile data if available, specifically role is often needed
                ...profile, 
                role: profile?.role || data.user.role // fallback
            }
        });

    } catch (error) {
        console.error('Login controller error:', error);
        res.status(500).json({ error: 'Internal server error processing login' });
    }
};

exports.getUser = (req, res) => {
    res.json({ message: 'User profile endpoint' });
};
