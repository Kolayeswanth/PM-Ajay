
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    console.log('Checking for executing_agency_id...');
    const { data, error } = await supabase
        .from('work_orders')
        .select('executing_agency_id')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Column exists!');
    }
}

checkColumn();
