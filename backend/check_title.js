
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTitle() {
    console.log('Checking for title column...');
    const { data, error } = await supabase
        .from('work_orders')
        .select('title')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        // Try 'work_title' just in case
        const { error: error2 } = await supabase.from('work_orders').select('work_title').limit(1);
        if (!error2) console.log('Found work_title!');
    } else {
        console.log('Column title exists!');
    }
}

checkTitle();
