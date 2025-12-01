
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProposals() {
    console.log('--- Checking district_proposals ---');
    const { data, error } = await supabase.from('district_proposals').select('*').limit(1);

    if (data && data.length) {
        console.log('Keys:', Object.keys(data[0]));
    } else {
        console.log('No data or error:', error?.message);
    }
}

checkProposals();
