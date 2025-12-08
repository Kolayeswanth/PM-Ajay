const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndCleanupExcessAgencies() {
    try {
        // Fetch all states
        const { data: states } = await supabase.from('states').select('*');
        const stateMap = {};
        states.forEach(s => stateMap[s.id] = s.name || s.state_name || `State ${s.id}`);

        // Fetch all agencies
        const { data: agencies } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('state_id', { ascending: true })
            .order('id', { ascending: true });

        // Group by state
        const byState = {};
        agencies.forEach(a => {
            const sid = a.state_id || 'NULL';
            if (!byState[sid]) byState[sid] = [];
            byState[sid].push(a);
        });

        // Find states with more than 2
        const toDelete = [];
        console.log('States with MORE than 2 agencies:\n');
        let foundAny = false;

        for (const [sid, ags] of Object.entries(byState)) {
            if (ags.length > 2) {
                foundAny = true;
                console.log(`${stateMap[sid]} (${ags.length} agencies):`);
                ags.forEach((a, i) => {
                    if (i >= 2) {
                        console.log(`  DELETE: ${a.agency_name} (ID: ${a.id})`);
                        toDelete.push(a.id);
                    } else {
                        console.log(`  KEEP: ${a.agency_name} (ID: ${a.id})`);
                    }
                });
                console.log('');
            }
        }

        if (!foundAny) {
            console.log('✓ No states have more than 2 agencies. Database is already clean!\n');

            // Show summary
            console.log('Summary:');
            for (const [sid, ags] of Object.entries(byState)) {
                console.log(`  ${stateMap[sid]}: ${ags.length} agencies`);
            }
            return;
        }

        console.log(`\nTotal agencies to delete: ${toDelete.length}\n`);
        console.log('Deleting excess agencies...\n');

        const { error } = await supabase
            .from('implementing_agencies')
            .delete()
            .in('id', toDelete);

        if (error) {
            console.error('Error:', error);
        } else {
            console.log(`✓ Successfully deleted ${toDelete.length} agencies!`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

findAndCleanupExcessAgencies();
