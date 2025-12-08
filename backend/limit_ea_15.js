const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndCleanupExcessExecutingAgencies() {
    try {
        console.log('Starting cleanup of executing_agencies table (Limit 15)...\n');

        // Fetch all work orders to see which agencies are in use
        const { data: workOrders, error: woError } = await supabase
            .from('work_orders')
            .select('executing_agency_id')
            .not('executing_agency_id', 'is', null);

        if (woError) {
            console.error('Error fetching work orders:', woError);
            return;
        }

        const assignedAgencyIds = new Set(workOrders.map(wo => wo.executing_agency_id));
        console.log(`Found ${assignedAgencyIds.size} executing agencies currently assigned to work orders\n`);

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

        // Group by state_name
        const byState = {};
        agencies.forEach(a => {
            const stateName = a.state_name || 'UNKNOWN';

            if (!byState[stateName]) {
                byState[stateName] = [];
            }
            byState[stateName].push(a);
        });

        // Find states with more than 15 and identify which to delete
        const toDelete = [];
        console.log('States with MORE than 15 executing agencies:');
        console.log('='.repeat(80));
        let foundAny = false;
        let skippedDueToAssignment = 0;
        const LIMIT = 15;

        for (const [stateName, stateAgencies] of Object.entries(byState)) {
            if (stateAgencies.length > LIMIT) {
                foundAny = true;
                console.log(`\n${stateName}: ${stateAgencies.length} agencies`);

                // Separate assigned and unassigned agencies
                const assigned = stateAgencies.filter(a => assignedAgencyIds.has(a.id));
                const unassigned = stateAgencies.filter(a => !assignedAgencyIds.has(a.id));

                console.log(`  Assigned to work orders: ${assigned.length}`);
                console.log(`  Unassigned: ${unassigned.length}`);

                // Keep first 15 agencies (prioritize assigned ones)
                // If assigned count >= LIMIT, we keep all assigned and delete all unassigned.
                // If assigned count < LIMIT, we keep all assigned + some unassigned to reach LIMIT.

                let toKeep = [];
                let toDeleteFromState = [];

                if (assigned.length >= LIMIT) {
                    toKeep = [...assigned]; // Keep all assigned
                    toDeleteFromState = [...unassigned]; // Delete all unassigned
                    // Note: If assigned > LIMIT, we actually keep MORE than LIMIT. This is safer.
                } else {
                    const needed = LIMIT - assigned.length;
                    toKeep = [...assigned, ...unassigned.slice(0, needed)];
                    toDeleteFromState = unassigned.slice(needed);
                }

                console.log(`  Will keep: ${toKeep.length} agencies`);
                // toKeep.forEach(a => {
                //     const status = assignedAgencyIds.has(a.id) ? '(ASSIGNED)' : '(unassigned)';
                //     console.log(`    ✓ KEEP: ${a.agency_name || a.name || 'N/A'} ${status} (ID: ${a.id})`);
                // });

                console.log(`  Will delete: ${toDeleteFromState.length} agencies`);
                toDeleteFromState.forEach(a => {
                    if (assignedAgencyIds.has(a.id)) {
                        // This shouldn't happen with logic above, but safety check
                        console.log(`    ⚠ SKIP (assigned - Unexpected): ${a.agency_name || a.name || 'N/A'} (ID: ${a.id})`);
                        skippedDueToAssignment++;
                    } else {
                        // console.log(`    ✗ DELETE: ${a.agency_name || a.name || 'N/A'} (ID: ${a.id})`);
                        toDelete.push(a.id);
                    }
                });
            }
        }

        if (!foundAny) {
            console.log('\n✓ No states have more than 15 executing agencies. Database is already clean!\n');
            return;
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\nTotal executing agencies to delete: ${toDelete.length}`);

        if (toDelete.length === 0) {
            console.log('No agencies to delete.');
            return;
        }

        console.log('Deleting in batches of 100...\n');

        // Delete in batches of 100
        let deletedCount = 0;
        const batchSize = 100;

        for (let i = 0; i < toDelete.length; i += batchSize) {
            const batch = toDelete.slice(i, i + batchSize);
            console.log(`Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toDelete.length / batchSize)} (${batch.length} items)...`);

            const { error: deleteError } = await supabase
                .from('executing_agencies')
                .delete()
                .in('id', batch);

            if (deleteError) {
                console.error('Error deleting batch:', deleteError);
                console.error('Failed at batch starting with ID:', batch[0]);
                break;
            }

            deletedCount += batch.length;
            console.log(`  ✓ Deleted ${deletedCount}/${toDelete.length} agencies so far`);
        }

        console.log(`\n✓ Successfully deleted ${deletedCount} executing agencies!\n`);

        if (skippedDueToAssignment > 0) {
            console.log(`⚠ Note: ${skippedDueToAssignment} agencies could not be deleted because they are assigned to work orders.\n`);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

findAndCleanupExcessExecutingAgencies();
