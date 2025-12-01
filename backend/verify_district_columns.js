
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyColumns() {
    console.log('Verifying new columns in work_orders...');
    const { data, error } = await supabase
        .from('work_orders')
        .select('implementing_agency_id, deadline, project_fund')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        console.log('❌ Columns likely missing. Please run ADD_DISTRICT_COLUMNS.sql');
    } else {
        console.log('✅ Columns found!');
    }
}

verifyColumns();
