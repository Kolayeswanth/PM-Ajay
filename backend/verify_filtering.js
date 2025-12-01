
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFiltering() {
    console.log('--- Verifying State Filtering ---');

    // 1. Get an Implementing Agency
    const { data: iaData, error: iaError } = await supabase
        .from('implementing_agencies')
        .select('user_id, state_name')
        .not('state_name', 'is', null) // Ensure they have a state
        .limit(1)
        .single();

    if (iaError) {
        console.error('Error fetching IA:', iaError);
        return;
    }

    if (!iaData) {
        console.log('No implementing agencies found with a state.');
        return;
    }

    const { user_id, state_name } = iaData;
    console.log(`Testing for User ID: ${user_id}`);
    console.log(`Target State: ${state_name}`);

    // 2. Fetch Executing Agencies for that State
    const { data: eaData, error: eaError } = await supabase
        .from('executing_agencies')
        .select('agency_name, state_name')
        .eq('state_name', state_name);

    if (eaError) {
        console.error('Error fetching EAs:', eaError);
        return;
    }

    console.log(`Found ${eaData.length} agencies in ${state_name}:`);
    eaData.forEach(ea => {
        if (ea.state_name !== state_name) {
            console.error(`❌ Mismatch! Agency ${ea.agency_name} is in ${ea.state_name}`);
        } else {
            console.log(`✅ ${ea.agency_name}`);
        }
    });
}

verifyFiltering();
