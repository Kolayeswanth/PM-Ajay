const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function create72ExecutingAgencies() {
    console.log('Creating exactly 72 executing agencies (36 states × 2)...\n');

    // Fetch all states
    const { data: states, error: statesError } = await supabase
        .from('states')
        .select('*')
        .order('id', { ascending: true });

    if (statesError) {
        console.error('Error fetching states:', statesError);
        return;
    }

    console.log(`Found ${states.length} states\n`);

    if (states.length !== 36) {
        console.log(`⚠ Warning: Found ${states.length} states, expected 36\n`);
    }

    const newAgencies = [];

    for (const state of states) {
        const stateName = state.name || state.state_name || `State ${state.id}`;

        // Create 2 agencies per state
        for (let i = 1; i <= 2; i++) {
            newAgencies.push({
                state_name: stateName,
                agency_name: `EA ${i} - ${stateName}`,
                email: `ea${i}.${stateName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                status: 'Active'
            });
        }
    }

    console.log(`Creating ${newAgencies.length} agencies...\n`);
    console.log('='.repeat(80));

    // Insert all agencies
    let created = 0;
    let failed = 0;

    for (const agency of newAgencies) {
        const { error } = await supabase
            .from('executing_agencies')
            .insert([agency]);

        if (error) {
            console.log(`✗ Failed: ${agency.agency_name} - ${error.message}`);
            failed++;
        } else {
            console.log(`✓ Created: ${agency.agency_name}`);
            created++;
        }
    }

    console.log('='.repeat(80));
    console.log(`\nSummary:`);
    console.log(`  ✓ Successfully created: ${created}`);
    console.log(`  ✗ Failed: ${failed}`);
    console.log(`  Total attempted: ${newAgencies.length}`);

    // Verify
    const { data: final } = await supabase
        .from('executing_agencies')
        .select('*');

    console.log(`\nVerification:`);
    console.log(`  Total agencies in database: ${final.length}`);
    console.log(`  Expected: 72 (36 states × 2)`);

    if (final.length === 72) {
        console.log('\n🎉 SUCCESS! Exactly 72 executing agencies created!');
    } else if (final.length > 72) {
        console.log(`\n⚠ Warning: Database has ${final.length} agencies (${final.length - 72} more than expected)`);
        console.log('   You may need to clean up excess agencies first.');
    } else {
        console.log(`\n⚠ Warning: Only ${final.length} agencies created (${72 - final.length} short of target)`);
    }
}

create72ExecutingAgencies();
