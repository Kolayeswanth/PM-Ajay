const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking fund_allocations schema...');
    const { data, error } = await supabase
        .from('fund_allocations')
        .select('*')
        .limit(2);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns in fund_allocations:', Object.keys(data[0]));
            console.log('Sample data:', data);
        } else {
            console.log('Table is empty');
        }
    }
}

checkSchema();
