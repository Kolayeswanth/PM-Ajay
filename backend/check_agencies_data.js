const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAgencies() {
    console.log('Checking implementing_agencies...');
    const { data, error } = await supabase
        .from('implementing_agencies')
        .select('id, agency_name, district_id');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Agencies:', data);
        const nullDistricts = data.filter(a => a.district_id === null);
        console.log(`Found ${nullDistricts.length} agencies with NULL district_id.`);
    }
}

checkAgencies();
