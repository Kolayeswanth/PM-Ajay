// Supabase Configuration
// These values should be stored in environment variables for production
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!SUPABASE_ANON_KEY && import.meta.env.MODE === 'production') {
    console.error('⚠️ VITE_SUPABASE_ANON_KEY is not set in environment variables');
}
