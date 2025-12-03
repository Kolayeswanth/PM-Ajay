const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkData() {
    // Check total work orders
    const { count, error } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true });

    console.log(`Total Work Orders: ${count}`);

    if (error) console.error(error);

    // Check work orders by state (via implementing_agencies)
    const { data: works } = await supabase
        .from('work_orders')
        .select(`
            id,
            implementing_agency_id,
            implementing_agencies (
                state_name
            )
        `);

    const stateCounts = {};
    works.forEach(w => {
        const state = w.implementing_agencies?.state_name || 'Unknown';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
    });

    console.log('\nWork Orders by State:');
    console.table(stateCounts);
}

checkData();
