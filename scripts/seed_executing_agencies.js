require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sampleAgencies = [
    { name: 'CPWD' },
    { name: 'PWD' },
    { name: 'DRDA' },
    { name: 'Forest Department' },
    { name: 'Irrigation Department' },
    { name: 'Rural Development Department' },
    { name: 'Social Welfare Department' },
    { name: 'Tribal Welfare Department' }
];

async function seedAgencies() {
    console.log('Checking executing_agencies table...');
    const { count, error: countError } = await supabase
        .from('executing_agencies')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error checking table:', countError);
        return;
    }

    if (count > 0) {
        console.log(`Table already has ${count} records. Skipping seed.`);
        return;
    }

    console.log('Seeding executing_agencies...');
    const { data, error } = await supabase
        .from('executing_agencies')
        .insert(sampleAgencies)
        .select();

    if (error) {
        console.error('Error seeding agencies:', error);
    } else {
        console.log(`Successfully inserted ${data.length} agencies.`);
    }
}

seedAgencies();
