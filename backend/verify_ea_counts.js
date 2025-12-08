const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCounts() {
    console.log('Verifying executing agency counts per state...\n');

    // Fetch all agencies
    const { data: agencies, error } = await supabase
        .from('executing_agencies')
        .select('state_name');

    if (error) {
        console.error('Error fetching agencies:', error);
        return;
    }

    // Group and count
    const counts = {};
    agencies.forEach(a => {
        const state = a.state_name || 'UNKNOWN';
        counts[state] = (counts[state] || 0) + 1;
    });

    console.log('Counts per state:');
    let allGood = true;
    for (const [state, count] of Object.entries(counts)) {
        console.log(`${state}: ${count}`);
        if (count > 15) {
            console.error(`❌ EXCEEDED LIMIT: ${state} has ${count}`);
            allGood = false;
        }
    }

    if (allGood) {
        console.log('\n✅ All states are within the limit of 15.');
    } else {
        console.log('\n❌ Some states still exceed the limit.');
    }
}

verifyCounts();
