const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureAllStatesHave2Agencies() {
    try {
        console.log('Ensuring all states have exactly 2 implementing agencies...\n');

        // Fetch all states
        const { data: states, error: statesError } = await supabase
            .from('states')
            .select('*')
            .order('id', { ascending: true });

        if (statesError) {
            console.error('Error fetching states:', statesError);
            return;
        }

        console.log(`Total states found: ${states.length}\n`);

        // Fetch all implementing agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('state_id', { ascending: true });

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        // Group agencies by state_id
        const agenciesByState = {};
        agencies.forEach(a => {
            const sid = a.state_id;
            if (!agenciesByState[sid]) {
                agenciesByState[sid] = [];
            }
            agenciesByState[sid].push(a);
        });

        // Find states that need more agencies
        const statesToUpdate = [];

        console.log('Current state of implementing agencies:');
        console.log('='.repeat(80));

        for (const state of states) {
            const stateId = state.id;
            const stateName = state.name || state.state_name || `State ${stateId}`;
            const currentCount = agenciesByState[stateId]?.length || 0;

            if (currentCount < 2) {
                const needed = 2 - currentCount;
                console.log(`⚠ ${stateName}: ${currentCount} agencies (needs ${needed} more)`);
                statesToUpdate.push({
                    id: stateId,
                    name: stateName,
                    currentCount,
                    needed
                });
            } else if (currentCount === 2) {
                console.log(`✓ ${stateName}: ${currentCount} agencies (perfect)`);
            } else {
                console.log(`✗ ${stateName}: ${currentCount} agencies (excess)`);
            }
        }

        console.log('='.repeat(80));
        console.log(`\nStates needing agencies: ${statesToUpdate.length}\n`);

        if (statesToUpdate.length === 0) {
            console.log('✓ All states already have 2 or more implementing agencies!\n');
            return;
        }

        // Create new agencies for states that need them
        const newAgencies = [];

        for (const state of statesToUpdate) {
            console.log(`\nCreating ${state.needed} agencies for ${state.name}:`);

            for (let i = 0; i < state.needed; i++) {
                const agencyNumber = state.currentCount + i + 1;
                const agencyName = `IA ${agencyNumber} - ${state.name}`;
                const email = `ia${agencyNumber}.${state.name.toLowerCase().replace(/\s+/g, '')}@example.com`;

                const newAgency = {
                    state_id: state.id,
                    agency_name: agencyName,
                    email: email
                };

                newAgencies.push(newAgency);
                console.log(`  + ${agencyName} (${email})`);
            }
        }

        console.log(`\n\nTotal new agencies to create: ${newAgencies.length}`);
        console.log('Inserting new agencies...\n');

        // Insert one at a time to see which ones fail
        let insertedCount = 0;

        for (const agency of newAgencies) {
            const { data, error: insertError } = await supabase
                .from('implementing_agencies')
                .insert([agency])
                .select();

            if (insertError) {
                console.error(`✗ Failed to insert ${agency.agency_name}:`, insertError.message);
            } else {
                insertedCount++;
                console.log(`✓ Inserted ${agency.agency_name}`);
            }
        }

        console.log(`\n✓ Successfully created ${insertedCount}/${newAgencies.length} new implementing agencies!\n`);

        // Verify final state
        const { data: finalAgencies, error: finalError } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('state_id', { ascending: true });

        if (finalError) {
            console.error('Error verifying final state:', finalError);
            return;
        }

        const finalByState = {};
        finalAgencies.forEach(a => {
            const sid = a.state_id;
            if (!finalByState[sid]) {
                finalByState[sid] = [];
            }
            finalByState[sid].push(a);
        });

        console.log('Final state after adding agencies:');
        console.log('='.repeat(80));

        let perfect = 0;
        let lessThan2 = 0;
        let moreThan2 = 0;

        for (const state of states) {
            const stateId = state.id;
            const stateName = state.name || state.state_name || `State ${stateId}`;
            const count = finalByState[stateId]?.length || 0;

            let status = '';
            if (count === 2) {
                status = '✓';
                perfect++;
            } else if (count < 2) {
                status = '⚠';
                lessThan2++;
            } else {
                status = '✗';
                moreThan2++;
            }

            console.log(`${status} ${stateName}: ${count} agencies`);
        }

        console.log('='.repeat(80));
        console.log(`\nSummary:`);
        console.log(`  States with exactly 2 agencies: ${perfect}`);
        console.log(`  States with less than 2: ${lessThan2}`);
        console.log(`  States with more than 2: ${moreThan2}`);
        console.log(`  Total states: ${states.length}`);
        console.log(`  Total agencies: ${finalAgencies.length}`);
        console.log('\n✓ Task completed successfully!');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

ensureAllStatesHave2Agencies();
