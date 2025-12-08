const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAgenciesPerState() {
    try {
        console.log('Verifying implementing_agencies count per state...\n');

        // Fetch all states
        const { data: states, error: statesError } = await supabase
            .from('states')
            .select('*')
            .order('id', { ascending: true });

        if (statesError) {
            console.error('Error fetching states:', statesError);
            return;
        }

        // Create a map of state_id to state_name
        const stateMap = {};
        states.forEach(state => {
            stateMap[state.id] = state.name || state.state_name || `State ${state.id}`;
        });

        // Fetch all implementing agencies
        const { data: agencies, error: fetchError } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('state_id', { ascending: true })
            .order('id', { ascending: true });

        if (fetchError) {
            console.error('Error fetching agencies:', fetchError);
            return;
        }

        console.log(`Total agencies found: ${agencies.length}\n`);

        // Group agencies by state_id
        const agenciesByState = {};
        agencies.forEach(agency => {
            const stateId = agency.state_id || 'NULL';
            const stateName = stateMap[stateId] || 'UNKNOWN';

            if (!agenciesByState[stateId]) {
                agenciesByState[stateId] = {
                    name: stateName,
                    agencies: []
                };
            }
            agenciesByState[stateId].agencies.push(agency);
        });

        // Display summary
        console.log('Summary of agencies per state:');
        console.log('='.repeat(100));

        let statesWithMoreThan2 = 0;
        let statesWith2 = 0;
        let statesWithLessThan2 = 0;

        for (const [stateId, stateData] of Object.entries(agenciesByState)) {
            const { name, agencies: stateAgencies } = stateData;
            const count = stateAgencies.length;

            let status = '✓';
            if (count > 2) {
                status = '✗ NEEDS CLEANUP';
                statesWithMoreThan2++;
            } else if (count === 2) {
                status = '✓ PERFECT';
                statesWith2++;
            } else {
                status = '⚠ LESS THAN 2';
                statesWithLessThan2++;
            }

            console.log(`${status.padEnd(20)} | ${name.padEnd(30)} | Count: ${count}`);

            if (count > 2) {
                console.log('  Agencies:');
                stateAgencies.forEach((agency, index) => {
                    const keepOrDelete = index < 2 ? 'KEEP' : 'DELETE';
                    console.log(`    [${keepOrDelete}] ${agency.agency_name || 'N/A'} (ID: ${agency.id})`);
                });
            }
        }

        console.log('='.repeat(100));
        console.log('\nStatistics:');
        console.log(`  States with exactly 2 agencies: ${statesWith2}`);
        console.log(`  States with less than 2 agencies: ${statesWithLessThan2}`);
        console.log(`  States with more than 2 agencies (NEED CLEANUP): ${statesWithMoreThan2}`);
        console.log(`  Total states: ${Object.keys(agenciesByState).length}`);

        if (statesWithMoreThan2 > 0) {
            console.log('\n⚠ WARNING: Some states have more than 2 agencies and need cleanup!');
        } else {
            console.log('\n✓ SUCCESS: All states have 2 or fewer implementing agencies!');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

verifyAgenciesPerState();
