
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCostColumn() {
    console.log('Checking for estimated_cost column...');
    const { data, error } = await supabase
        .from('work_orders')
        .select('estimated_cost')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        // Try alternatives
        const { error: error2 } = await supabase.from('work_orders').select('cost').limit(1);
        if (!error2) console.log('Found cost!');

        const { error: error3 } = await supabase.from('work_orders').select('amount').limit(1);
        if (!error3) console.log('Found amount!');

        const { error: error4 } = await supabase.from('work_orders').select('project_cost').limit(1);
        if (!error4) console.log('Found project_cost!');
    } else {
        console.log('Column estimated_cost exists!');
    }
}

checkCostColumn();
