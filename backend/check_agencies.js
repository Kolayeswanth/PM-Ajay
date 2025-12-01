
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgencies() {
    console.log('Fetching ALL executing agencies (Admin)...');
    const { data, error, count } = await supabase
        .from('executing_agencies')
        .select('agency_name', { count: 'exact' });

    if (error) {
        console.error('Error fetching agencies:', error);
    } else {
        console.log(`Found ${data.length} agencies.`);
        console.log('Agencies:', data.map(a => a.agency_name));
    }
}

checkAgencies();
