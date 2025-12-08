const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fillStateNames() {
    try {
        console.log('Filling state_name column for implementing agencies...\n');

        // Fetch all states (only valid columns)
        const { data: states, error: statesError } = await supabase
            .from('states')
            .select('id, name');

        if (statesError) {
            console.error('Error fetching states:', statesError);
            return;
        }

        const stateMap = {};
        states.forEach(s => {
            stateMap[s.id] = s.name;
        });

        console.log(`Loaded ${Object.keys(stateMap).length} states.`);

        // Fetch agencies with missing state_name
        const { data: agencies, error: agenciesError } = await supabase
            .from('implementing_agencies')
            .select('id, state_id, state_name')
            .is('state_name', null);

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        console.log(`Found ${agencies.length} agencies with missing state_name.\n`);

        if (agencies.length === 0) {
            console.log('✓ All agencies already have state_name populated.');
        }

        let updatedCount = 0;

        for (const agency of agencies) {
            if (agency.state_id && stateMap[agency.state_id]) {
                const nameToSet = stateMap[agency.state_id];

                const { error: updateError } = await supabase
                    .from('implementing_agencies')
                    .update({ state_name: nameToSet })
                    .eq('id', agency.id);

                if (updateError) {
                    console.log(`✗ Failed to update ${agency.id}:`, updateError.message);
                } else {
                    updatedCount++;
                    if (updatedCount % 50 === 0) {
                        process.stdout.write(`Updated ${updatedCount}... `);
                    }
                }
            }
        }

        console.log(`\n\n✅ Successfully populated state_name for ${updatedCount} agencies.`);

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

fillStateNames();
