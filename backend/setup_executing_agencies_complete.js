const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setupExecutingAgenciesComplete() {
    try {
        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  EXECUTING AGENCIES COMPLETE SETUP                                    ║');
        console.log('║  Goal: 36 states × 2 agencies = 72 executing agencies                ║');
        console.log('║  Password: Test123!                                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // STEP 1: Ensure exactly 2 agencies per state
        console.log('\n📋 STEP 1: Ensuring exactly 2 executing agencies per state...\n');
        await ensureExactly2PerState();

        // STEP 2: Create user accounts for all agencies
        console.log('\n\n👤 STEP 2: Creating user accounts for all executing agencies...\n');
        await createUserAccounts();

        // STEP 3: Final verification
        console.log('\n\n✅ STEP 3: Final Verification...\n');
        await finalVerification();

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

async function ensureExactly2PerState() {
    const { data: states } = await supabase.from('states').select('*').order('id');
    const { data: agencies } = await supabase.from('executing_agencies').select('*').order('state_name').order('id');

    const stateMap = {};
    states.forEach(s => stateMap[s.id] = s.name || s.state_name || `State ${s.id}`);

    const agenciesByState = {};
    agencies.forEach(a => {
        const stateName = a.state_name || 'UNKNOWN';
        if (!agenciesByState[stateName]) agenciesByState[stateName] = [];
        agenciesByState[stateName].push(a);
    });

    const toDelete = [];
    const toCreate = [];

    for (const state of states) {
        const stateName = state.name || state.state_name || `State ${state.id}`;
        const current = agenciesByState[stateName] || [];

        if (current.length > 2) {
            toDelete.push(...current.slice(2).map(a => a.id));
            console.log(`  ✗ ${stateName}: ${current.length} agencies → deleting ${current.length - 2}`);
        } else if (current.length < 2) {
            const needed = 2 - current.length;
            for (let i = 0; i < needed; i++) {
                toCreate.push({
                    state_name: stateName,
                    agency_name: `EA ${current.length + i + 1} - ${stateName}`,
                    email: `ea${current.length + i + 1}.${stateName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    status: 'Active'
                });
            }
            console.log(`  ⚠ ${stateName}: ${current.length} agencies → creating ${needed}`);
        } else {
            console.log(`  ✓ ${stateName}: 2 agencies (perfect)`);
        }
    }

    // Delete excess
    if (toDelete.length > 0) {
        console.log(`\n  Deleting ${toDelete.length} excess agencies...`);
        for (let i = 0; i < toDelete.length; i += 50) {
            const batch = toDelete.slice(i, i + 50);
            const { error } = await supabase.from('executing_agencies').delete().in('id', batch);
            if (error) {
                console.log(`  ⚠ Error deleting some agencies (may be assigned to work orders):`, error.message);
            }
        }
    }

    // Create missing
    if (toCreate.length > 0) {
        console.log(`\n  Creating ${toCreate.length} new agencies...`);
        for (const agency of toCreate) {
            const { error } = await supabase.from('executing_agencies').insert([agency]);
            if (error) {
                console.log(`  ✗ Failed to create ${agency.agency_name}:`, error.message);
            } else {
                console.log(`  ✓ Created ${agency.agency_name}`);
            }
        }
    }

    console.log(`\n  ✅ Step 1 complete!`);
}

async function createUserAccounts() {
    const { data: agencies } = await supabase.from('executing_agencies').select('*').order('state_name').order('id');

    const password = 'Test123!';
    let created = 0, exists = 0, errors = 0;

    for (const agency of agencies) {
        if (!agency.email) {
            console.log(`  ⚠ SKIP: ${agency.agency_name} - No email`);
            errors++;
            continue;
        }

        if (agency.user_id) {
            console.log(`  ✓ EXISTS: ${agency.agency_name}`);
            exists++;
            continue;
        }

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: agency.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                role: 'executing_agency',
                agency_name: agency.agency_name,
                state: agency.state_name
            }
        });

        if (authError) {
            if (authError.message.includes('already registered')) {
                console.log(`  ✓ EXISTS: ${agency.agency_name} (already registered)`);
                exists++;

                const { data: users } = await supabase.auth.admin.listUsers();
                const existingUser = users?.users?.find(u => u.email === agency.email);
                if (existingUser) {
                    await supabase.from('executing_agencies').update({ user_id: existingUser.id }).eq('id', agency.id);
                }
            } else {
                console.log(`  ✗ ERROR: ${agency.agency_name} - ${authError.message}`);
                errors++;
            }
            continue;
        }

        const { error: updateError } = await supabase.from('executing_agencies').update({ user_id: authData.user.id }).eq('id', agency.id);

        if (!updateError) {
            console.log(`  ✓ CREATED: ${agency.agency_name}`);
            created++;
        } else {
            console.log(`  ⚠ Created user but failed to link: ${agency.agency_name}`);
            errors++;
        }
    }

    console.log(`\n  Summary: ${created} created, ${exists} existed, ${errors} errors`);
    console.log(`  ✅ Step 2 complete!`);
}

async function finalVerification() {
    const { data: states } = await supabase.from('states').select('*');
    const { data: agencies } = await supabase.from('executing_agencies').select('*');

    const withUsers = agencies.filter(a => a.user_id);

    const agenciesByState = {};
    agencies.forEach(a => {
        const stateName = a.state_name || 'UNKNOWN';
        if (!agenciesByState[stateName]) agenciesByState[stateName] = [];
        agenciesByState[stateName].push(a);
    });

    let perfect = 0;
    for (const state of states) {
        const stateName = state.name || state.state_name;
        const count = agenciesByState[stateName]?.length || 0;
        if (count === 2) perfect++;
    }

    console.log('╔═══════════════════════════════════════════════════════════════════════╗');
    console.log('║  FINAL RESULTS                                                        ║');
    console.log('╠═══════════════════════════════════════════════════════════════════════╣');
    console.log(`║  Total States: ${states.length.toString().padEnd(58)}║`);
    console.log(`║  Total Executing Agencies: ${agencies.length.toString().padEnd(47)}║`);
    console.log(`║  Agencies with User Accounts: ${withUsers.length.toString().padEnd(42)}║`);
    console.log(`║  States with exactly 2 agencies: ${perfect.toString().padEnd(39)}║`);
    console.log('╠═══════════════════════════════════════════════════════════════════════╣');

    if (agencies.length === 72 && withUsers.length === 72 && perfect === 36) {
        console.log('║  🎉 SUCCESS! All requirements met!                                   ║');
        console.log('║  ✓ 36 states × 2 agencies = 72 executing agencies                    ║');
        console.log('║  ✓ All agencies have user accounts                                   ║');
        console.log('║  ✓ Password: Test123!                                                ║');
    } else {
        console.log('║  ⚠ Partial Success                                                   ║');
        if (agencies.length !== 72) {
            console.log(`║    - Total agencies: ${agencies.length} (expected 72)${' '.repeat(Math.max(0, 36 - agencies.length.toString().length))}║`);
        }
        if (withUsers.length !== agencies.length) {
            console.log(`║    - ${agencies.length - withUsers.length} agencies without user accounts${' '.repeat(Math.max(0, 33 - (agencies.length - withUsers.length).toString().length))}║`);
        }
        if (perfect !== 36) {
            console.log(`║    - ${36 - perfect} states don't have exactly 2 agencies${' '.repeat(Math.max(0, 31 - (36 - perfect).toString().length))}║`);
        }
    }

    console.log('╚═══════════════════════════════════════════════════════════════════════╝');
}

setupExecutingAgenciesComplete();
