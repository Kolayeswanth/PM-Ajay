
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findDistrictColumns() {
    console.log('--- Checking for "district" columns ---');

    // Check Work Orders
    const { data: woData } = await supabase.from('work_orders').select('*').limit(1);
    if (woData && woData.length) {
        const keys = Object.keys(woData[0]);
        const districtKeys = keys.filter(k => k.includes('district'));
        console.log('Work Orders District Keys:', districtKeys);
    } else {
        console.log('Work Orders: No data or error');
    }

    // Check Implementing Agencies
    const { data: iaData } = await supabase.from('implementing_agencies').select('*').limit(1);
    if (iaData && iaData.length) {
        const keys = Object.keys(iaData[0]);
        const districtKeys = keys.filter(k => k.includes('district'));
        console.log('Implementing Agencies District Keys:', districtKeys);
    } else {
        console.log('Implementing Agencies: No data or error');
    }
}

findDistrictColumns();
