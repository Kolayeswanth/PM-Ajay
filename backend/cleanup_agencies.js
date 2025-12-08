const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupImplementingAgencies() {
    try {
        console.log('Starting cleanup of implementing_agencies table...\n');

        // Step 1: Fetch all states first
        const { data: states, error: statesError } = await supabase
            .from('states')
            .select('*');

        if (statesError) {
            console.error('Error fetching states:', statesError);
            return;
        }

        // Create a map of state_id to state_name
        const stateMap = {};
        states.forEach(state => {
            stateMap[state.id] = state.name || state.state_name || `State ${state.id}`;
        });

        // Step 2: Fetch all implementing agencies
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

        // Step 3: Group agencies by state_id
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

        // Step 4: Display current state and identify agencies to delete
        console.log('Current state of agencies by state:');
        console.log('='.repeat(80));

        const agenciesToDelete = [];

        for (const [stateId, stateData] of Object.entries(agenciesByState)) {
            const { name, agencies: stateAgencies } = stateData;
            console.log(`\n${name} (ID: ${stateId}): ${stateAgencies.length} agencies`);

            stateAgencies.forEach((agency, index) => {
                const status = index < 2 ? '✓ KEEP' : '✗ DELETE';
                console.log(`  ${status} - ID: ${agency.id}, Name: ${agency.agency_name || 'N/A'}, Email: ${agency.email || 'N/A'}`);

                if (index >= 2) {
                    agenciesToDelete.push(agency.id);
                }
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\nTotal agencies to delete: ${agenciesToDelete.length}\n`);

        if (agenciesToDelete.length === 0) {
            console.log('✓ No cleanup needed! All states already have 2 or fewer agencies.');
            return;
        }

        // Step 5: Confirm and delete
        console.log('Agencies to be deleted (IDs):', agenciesToDelete);
        console.log('\nProceeding with deletion...\n');

        const { data: deleteData, error: deleteError } = await supabase
            .from('implementing_agencies')
            .delete()
            .in('id', agenciesToDelete);

        if (deleteError) {
            console.error('Error deleting agencies:', deleteError);
            return;
        }

        console.log(`✓ Successfully deleted ${agenciesToDelete.length} agencies!\n`);

        // Step 6: Verify final state
        const { data: finalAgencies, error: finalError } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('state_id', { ascending: true });

        if (finalError) {
            console.error('Error verifying final state:', finalError);
            return;
        }

        const finalByState = {};
        finalAgencies.forEach(agency => {
            const stateId = agency.state_id || 'NULL';
            const stateName = stateMap[stateId] || 'UNKNOWN';

            if (!finalByState[stateId]) {
                finalByState[stateId] = {
                    name: stateName,
                    agencies: []
                };
            }
            finalByState[stateId].agencies.push(agency);
        });

        console.log('Final state after cleanup:');
        console.log('='.repeat(80));
        for (const [stateId, stateData] of Object.entries(finalByState)) {
            const { name, agencies: stateAgencies } = stateData;
            console.log(`\n${name} (ID: ${stateId}): ${stateAgencies.length} agencies`);
            stateAgencies.forEach(agency => {
                console.log(`  - ID: ${agency.id}, Name: ${agency.agency_name || 'N/A'}, Email: ${agency.email || 'N/A'}`);
            });
        }
        console.log('='.repeat(80));
        console.log('\n✓ Cleanup completed successfully!');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Run the cleanup
cleanupImplementingAgencies();
