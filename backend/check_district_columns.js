
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDistrictColumns() {
    console.log('--- Work Orders ---');
    const { data: woData, error: woError } = await supabase
        .from('work_orders')
        .select('*')
        .limit(1);

    if (woData && woData.length) console.log('WO Keys:', Object.keys(woData[0]));
    else console.log('WO Error/Empty:', woError?.message || 'Empty');

    console.log('\n--- Implementing Agencies ---');
    const { data: iaData, error: iaError } = await supabase
        .from('implementing_agencies')
        .select('*')
        .limit(1);

    if (iaData && iaData.length) console.log('IA Keys:', Object.keys(iaData[0]));
    else console.log('IA Error/Empty:', iaError?.message || 'Empty');
}

checkDistrictColumns();
