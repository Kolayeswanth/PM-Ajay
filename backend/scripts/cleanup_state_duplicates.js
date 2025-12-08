const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
if (!process.env.SUPABASE_URL) require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDuplicates() {
    console.log('Fetching all state assignments to clean up duplicates...');

    // Get all admins
    const { data: admins, error } = await supabase
        .from('state_assignment')
        .select('*')
        .order('id', { ascending: true }); // Oldest first

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log(`Total records found: ${admins.length}`);

    const stateMap = {};

    // Group by normalized state name
    admins.forEach(admin => {
        const normalizedState = admin.state_name.trim().toLowerCase();
        if (!stateMap[normalizedState]) {
            stateMap[normalizedState] = [];
        }
        stateMap[normalizedState].push(admin);
    });

    for (const [stateKey, adminList] of Object.entries(stateMap)) {
        if (adminList.length > 1) {
            console.log(`\nFound ${adminList.length} duplicates for state: "${stateKey}"`);

            // Sort by ID descending (keep the latest)
            adminList.sort((a, b) => b.id - a.id);

            const toKeep = adminList[0];
            const toDelete = adminList.slice(1);

            console.log(`✅ Keeping latest: ID ${toKeep.id} (${toKeep.admin_name} - ${toKeep.state_name})`);

            for (const admin of toDelete) {
                console.log(`❌ Deleting duplicate: ID ${admin.id} (${admin.admin_name} - ${admin.state_name})`);

                const { error: deleteError } = await supabase
                    .from('state_assignment')
                    .delete()
                    .eq('id', admin.id);

                if (deleteError) {
                    console.error(`   Failed to delete ID ${admin.id}: ${deleteError.message}`);
                } else {
                    console.log(`   Successfully deleted ID ${admin.id}`);
                }
            }
        }
    }
    console.log('\nCleanup process completed.');
}

cleanupDuplicates();
