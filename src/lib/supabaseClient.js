import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use hardcoded fallback (for debugging/stability)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
