const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureAllStatesHave2ExecutingAgencies() {
    try {
        console.log('Ensuring all states have exactly 2 executing agencies...\n');

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

        // Create state name map
        const stateMap = {};
        states.forEach(s => {
            stateMap[s.id] = s.name || s.state_name || `State ${s.id}`;
        });

        // Fetch all executing agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('executing_agencies')
            .select('*')
            .order('state_name', { ascending: true })
            .order('id', { ascending: true });

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        console.log(`Total executing agencies found: ${agencies.length}\n`);

        // Group agencies by state_name
        const agenciesByState = {};
        agencies.forEach(a => {
            const stateName = a.state_name || 'UNKNOWN';
            if (!agenciesByState[stateName]) {
                agenciesByState[stateName] = [];
            }
            agenciesByState[stateName].push(a);
        });

        // Identify what needs to be done for each state
        const statesToCreate = [];
        const statesToDelete = [];

        console.log('Current state of executing agencies:');
        console.log('='.repeat(80));

        for (const state of states) {
            const stateName = state.name || state.state_name || `State ${state.id}`;
            const currentCount = agenciesByState[stateName]?.length || 0;

            if (currentCount < 2) {
                const needed = 2 - currentCount;
                console.log(`⚠ ${stateName}: ${currentCount} agencies (needs ${needed} more)`);
                statesToCreate.push({
                    name: stateName,
                    currentCount,
                    needed
                });
            } else if (currentCount === 2) {
                console.log(`✓ ${stateName}: ${currentCount} agencies (perfect)`);
            } else {
                console.log(`✗ ${stateName}: ${currentCount} agencies (needs to delete ${currentCount - 2})`);
                const toDelete = agenciesByState[stateName].slice(2); // Keep first 2, delete rest
                statesToDelete.push(...toDelete.map(a => a.id));
            }
        }

        console.log('='.repeat(80));
        console.log(`\nStates needing new agencies: ${statesToCreate.length}`);
        console.log(`Agencies to delete: ${statesToDelete.length}\n`);

        // Step 1: Delete excess agencies
        if (statesToDelete.length > 0) {
            console.log(`Deleting ${statesToDelete.length} excess agencies...\n`);

            const batchSize = 100;
            let deletedCount = 0;

            for (let i = 0; i < statesToDelete.length; i += batchSize) {
                const batch = statesToDelete.slice(i, i + batchSize);
                console.log(`Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(statesToDelete.length / batchSize)}...`);

                const { error: deleteError } = await supabase
                    .from('executing_agencies')
                    .delete()
                    .in('id', batch);

                if (deleteError) {
                    console.error('Error deleting batch:', deleteError);
                    console.log('⚠ Note: Some agencies may be assigned to work orders and cannot be deleted.');
                    break;
                }

                deletedCount += batch.length;
                console.log(`  ✓ Deleted ${deletedCount}/${statesToDelete.length}`);
            }

            console.log(`\n✓ Deleted ${deletedCount} agencies\n`);
        }

        // Step 2: Create new agencies for states that need them
        if (statesToCreate.length > 0) {
            const newAgencies = [];

            console.log('Creating new executing agencies...\n');

            for (const state of statesToCreate) {
                console.log(`Creating ${state.needed} agencies for ${state.name}:`);

                for (let i = 0; i < state.needed; i++) {
                    const agencyNumber = state.currentCount + i + 1;
                    const agencyName = `EA ${agencyNumber} - ${state.name}`;
                    const email = `ea${agencyNumber}.${state.name.toLowerCase().replace(/\s+/g, '')}@example.com`;

                    const newAgency = {
                        state_name: state.name,
                        agency_name: agencyName,
                        email: email,
                        status: 'Active'
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
                    .from('executing_agencies')
                    .insert([agency])
                    .select();

                if (insertError) {
                    console.error(`✗ Failed to insert ${agency.agency_name}:`, insertError.message);
                } else {
                    insertedCount++;
                    console.log(`✓ Inserted ${agency.agency_name}`);
                }
            }

            console.log(`\n✓ Successfully created ${insertedCount}/${newAgencies.length} new executing agencies!\n`);
        }

        // Step 3: Verify final state
        const { data: finalAgencies, error: finalError } = await supabase
            .from('executing_agencies')
            .select('*')
            .order('state_name', { ascending: true });

        if (finalError) {
            console.error('Error verifying final state:', finalError);
            return;
        }

        const finalByState = {};
        finalAgencies.forEach(a => {
            const stateName = a.state_name || 'UNKNOWN';
            if (!finalByState[stateName]) {
                finalByState[stateName] = [];
            }
            finalByState[stateName].push(a);
        });

        console.log('Final state after adjustments:');
        console.log('='.repeat(80));

        let perfect = 0;
        let lessThan2 = 0;
        let moreThan2 = 0;

        for (const state of states) {
            const stateName = state.name || state.state_name || `State ${state.id}`;
            const count = finalByState[stateName]?.length || 0;

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

        if (perfect === states.length) {
            console.log('\n🎉 SUCCESS! All states have exactly 2 executing agencies!');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

ensureAllStatesHave2ExecutingAgencies();
