
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllColumns() {
    console.log('--- Work Orders Schema ---');
    const { data, error } = await supabase.from('work_orders').select('*').limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else if (data.length > 0) {
        console.log('Keys:', Object.keys(data[0]));
        console.log('Sample Status:', data[0].status);
    } else {
        console.log('No data found.');
    }
}

checkAllColumns();
