const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function createExecutingAgencyUsers() {
    const password = 'Test123!';

    console.log('Creating user accounts for executing agencies...\n');

    const { data: agencies, error: agenciesError } = await supabase
        .from('executing_agencies')
        .select('*')
        .order('state_name', { ascending: true })
        .order('id', { ascending: true });

    if (agenciesError) {
        console.error('Error fetching agencies:', agenciesError);
        return;
    }

    console.log(`Found ${agencies.length} executing agencies\n`);
    console.log('='.repeat(80));

    let created = 0;
    let exists = 0;
    let errors = 0;

    for (const agency of agencies) {
        if (!agency.email) {
            console.log(`⚠ SKIP: ${agency.agency_name} - No email address`);
            errors++;
            continue;
        }

        if (agency.user_id) {
            console.log(`✓ EXISTS: ${agency.agency_name}`);
            exists++;
            continue;
        }

        const { data: authData, error } = await supabase.auth.admin.createUser({
            email: agency.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                role: 'executing_agency',
                agency_name: agency.agency_name,
                state: agency.state_name
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log(`✓ EXISTS: ${agency.agency_name} (already registered)`);
                exists++;

                // Try to link existing user
                const { data: users } = await supabase.auth.admin.listUsers();
                const existingUser = users?.users?.find(u => u.email === agency.email);

                if (existingUser) {
                    await supabase
                        .from('executing_agencies')
                        .update({ user_id: existingUser.id })
                        .eq('id', agency.id);
                    console.log(`  → Linked existing user`);
                }
            } else {
                console.log(`✗ ERROR: ${agency.agency_name} - ${error.message}`);
                errors++;
            }
            continue;
        }

        // Link user to agency
        const { error: updateError } = await supabase
            .from('executing_agencies')
            .update({ user_id: authData.user.id })
            .eq('id', agency.id);

        if (updateError) {
            console.log(`✓ CREATED USER: ${agency.agency_name} (but failed to link)`);
            errors++;
        } else {
            console.log(`✓ CREATED: ${agency.agency_name}`);
            created++;
        }
    }

    console.log('='.repeat(80));
    console.log(`\n✅ Summary:`);
    console.log(`   New users created: ${created}`);
    console.log(`   Users already existed: ${exists}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total agencies: ${agencies.length}`);
    console.log(`   Total with accounts: ${created + exists}`);
    console.log(`   Password for all accounts: ${password}`);

    if (created + exists === 72) {
        console.log('\n🎉 SUCCESS! All 72 executing agencies have user accounts!');
    } else if (created + exists === agencies.length) {
        console.log(`\n✓ All ${agencies.length} executing agencies have user accounts!`);
    }
}

createExecutingAgencyUsers();
