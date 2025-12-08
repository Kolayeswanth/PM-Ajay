const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyExecutingAgencies() {
    try {
        // Fetch all executing agencies
        const { data: agencies } = await supabase
            .from('executing_agencies')
            .select('*')
            .order('state_name', { ascending: true });

        // Group by state
        const byState = {};
        agencies.forEach(a => {
            const stateName = a.state_name || 'UNKNOWN';
            if (!byState[stateName]) byState[stateName] = 0;
            byState[stateName]++;
        });

        console.log('Executing Agencies per State:');
        console.log('='.repeat(60));

        let moreThan2 = 0;
        let exactly2 = 0;
        let lessThan2 = 0;

        for (const [state, count] of Object.entries(byState).sort()) {
            const status = count > 2 ? '✗' : count === 2 ? '✓' : '⚠';
            console.log(`${status} ${state.padEnd(30)} : ${count} agencies`);

            if (count > 2) moreThan2++;
            else if (count === 2) exactly2++;
            else lessThan2++;
        }

        console.log('='.repeat(60));
        console.log(`\nSummary:`);
        console.log(`  States with exactly 2 agencies: ${exactly2}`);
        console.log(`  States with less than 2: ${lessThan2}`);
        console.log(`  States with more than 2 (need cleanup): ${moreThan2}`);
        console.log(`  Total states: ${Object.keys(byState).length}`);
        console.log(`  Total agencies: ${agencies.length}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyExecutingAgencies();
