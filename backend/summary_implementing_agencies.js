const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function showFinalSummary() {
    try {
        // Fetch all states
        const { data: states } = await supabase.from('states').select('*').order('id');

        // Fetch all implementing agencies
        const { data: agencies } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('state_id');

        // Group by state
        const byState = {};
        agencies.forEach(a => {
            if (!byState[a.state_id]) byState[a.state_id] = [];
            byState[a.state_id].push(a);
        });

        console.log('\n='.repeat(70));
        console.log('FINAL SUMMARY: Implementing Agencies per State');
        console.log('='.repeat(70));

        let exactly2 = 0;
        let lessThan2 = 0;
        let moreThan2 = 0;

        for (const state of states) {
            const count = byState[state.id]?.length || 0;
            const stateName = (state.name || state.state_name || `State ${state.id}`).padEnd(30);

            if (count === 2) {
                console.log(`✓ ${stateName} : ${count} agencies`);
                exactly2++;
            } else if (count < 2) {
                console.log(`⚠ ${stateName} : ${count} agencies (MISSING)`);
                lessThan2++;
            } else {
                console.log(`✗ ${stateName} : ${count} agencies (EXCESS)`);
                moreThan2++;
            }
        }

        console.log('='.repeat(70));
        console.log('\nSTATISTICS:');
        console.log(`  ✓ States with exactly 2 agencies: ${exactly2}`);
        console.log(`  ⚠ States with less than 2: ${lessThan2}`);
        console.log(`  ✗ States with more than 2: ${moreThan2}`);
        console.log(`  Total states: ${states.length}`);
        console.log(`  Total implementing agencies: ${agencies.length}`);

        if (exactly2 === states.length) {
            console.log('\n🎉 SUCCESS! All states have exactly 2 implementing agencies!');
        } else if (lessThan2 === 0 && moreThan2 === 0) {
            console.log('\n✓ All states have at least 2 agencies!');
        } else {
            console.log(`\n⚠ ${lessThan2 + moreThan2} states still need adjustment.`);
        }
        console.log('='.repeat(70) + '\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

showFinalSummary();
