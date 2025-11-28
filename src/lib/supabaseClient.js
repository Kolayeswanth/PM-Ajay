import { createClient } from '@supabase/supabase-js';

// ACTIVE PROJECT: gwfeaubvzjepmmhxgdvc (Morning Organization - Has all data)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing! Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
