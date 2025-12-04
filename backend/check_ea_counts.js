const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEACounts() {
    const { data } = await supabase
        .from('executing_agencies')
        .select('state_name');

    const states = {};
    data.forEach(a => {
        const state = a.state_name || 'NULL';
        states[state] = (states[state] || 0) + 1;
    });

    console.log('Executing Agencies by state:');
    Object.entries(states).sort((a, b) => b[1] - a[1]).forEach(([state, count]) => {
        console.log(`  ${state}: ${count}`);
    });
}

checkEACounts();
