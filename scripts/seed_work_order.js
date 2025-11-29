import { createClient } from '@supabase/supabase-js';

// Hardcoded from src/lib/supabaseClient.js
const supabaseUrl = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('Authenticating...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'centre@pmajay.gov.in',
        password: 'Centre@2024!Secure'
    });

    if (authError) {
        console.error('Authentication failed:', authError);
        process.exit(1);
    }

    console.log('Authenticated as:', authData.user.email);

    console.log('Seeding work order...');

    // Check for existing
    const { data: existing } = await supabase
        .from('work_orders')
        .select('*')
        .eq('title', 'Construction of Community Hall')
        .single();

    if (existing) {
        console.log('Work order already exists:', existing);
        return;
    }

    const { data, error } = await supabase
        .from('work_orders')
        .insert([
            {
                title: 'Construction of Community Hall',
                location: 'Shirur GP',
                contractor: 'M/s Patil Constructions',
                amount: 1500000,
                date: '2025-10-01',
                deadline: '2026-03-31',
                status: 'Not Started',
                progress: 0,
                funds_released: 0,
                funds_used: 0,
                funds_remaining: 0,
                remarks: ''
            }
        ])
        .select();

    if (error) {
        console.error('Error inserting work order:', error);
    } else {
        console.log('Success:', data);
    }
}

seed();
