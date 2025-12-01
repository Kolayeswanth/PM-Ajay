
require('dotenv').config({ path: '../.env' }); // Load from root .env
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Anon Key in .env');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgencies() {
    console.log('Fetching executing agencies (Anon)...');
    const { data, error } = await supabase
        .from('executing_agencies')
        .select('agency_name', { count: 'exact' });

    if (error) {
        console.error('Error fetching agencies:', error);
    } else {
        console.log(`Found ${data.length} agencies.`);
    }
}

checkAgencies();
