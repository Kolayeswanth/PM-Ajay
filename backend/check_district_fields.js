
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDistrictFields() {
    console.log('--- Work Orders ---');
    const { data: wo, error: woError } = await supabase.from('work_orders').select('district_id, district_name').limit(1);
    if (woError) console.log('WO Error:', woError.message);
    else console.log('WO Columns:', wo.length > 0 ? Object.keys(wo[0]) : 'No data');

    console.log('--- Implementing Agencies ---');
    const { data: ia, error: iaError } = await supabase.from('implementing_agencies').select('district_id, district_name').limit(1);
    if (iaError) console.log('IA Error:', iaError.message);
    else console.log('IA Columns:', ia.length > 0 ? Object.keys(ia[0]) : 'No data');
}

checkDistrictFields();
