
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchemas() {
    console.log('--- Executing Agencies Schema ---');
    const { data: eaData, error: eaError } = await supabase
        .from('executing_agencies')
        .select('*')
        .limit(1);

    if (eaError) console.error(eaError);
    else if (eaData.length) console.log(Object.keys(eaData[0]));
    else console.log('No data in executing_agencies');

    console.log('\n--- Implementing Agencies Schema ---');
    const { data: iaData, error: iaError } = await supabase
        .from('implementing_agencies')
        .select('*')
        .limit(1);

    if (iaError) console.error(iaError);
    else if (iaData.length) console.log(Object.keys(iaData[0]));
    else console.log('No data in implementing_agencies');
}

checkSchemas();
