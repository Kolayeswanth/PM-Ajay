
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchSampleLocation() {
    console.log('--- Fetching Sample Location ---');

    const { data, error } = await supabase.from('work_orders').select('location').limit(5);
    if (error) console.log('Error:', error.message);
    else {
        console.log('Locations:', data.map(d => d.location));
    }
}

fetchSampleLocation();
