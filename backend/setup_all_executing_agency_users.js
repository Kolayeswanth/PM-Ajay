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

async function setupAllExecutingAgencyUsers() {
    try {
        console.log('Setting up user accounts for all executing agencies...\n');

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

        if (agencies.length !== 72) {
            console.log(`⚠ Warning: Expected 72 agencies (36 states × 2), but found ${agencies.length}`);
        }

        const password = 'Test123!';
        let createdCount = 0;
        let alreadyExistsCount = 0;
        let errorCount = 0;

        console.log('Creating user accounts...\n');
        console.log('='.repeat(80));

        for (const agency of agencies) {
            const email = agency.email;
            const agencyName = agency.agency_name || 'Unknown Agency';
            const stateName = agency.state_name || 'Unknown State';

            if (!email) {
                console.log(`⚠ SKIP: ${agencyName} - No email address`);
                errorCount++;
                continue;
            }

            // Check if user already exists
            if (agency.user_id) {
                console.log(`✓ EXISTS: ${agencyName} (${email}) - User already created`);
                alreadyExistsCount++;
                continue;
            }

            // Create user account
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    role: 'executing_agency',
                    agency_name: agencyName,
                    state: stateName
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    console.log(`✓ EXISTS: ${agencyName} (${email}) - User already registered`);
                    alreadyExistsCount++;

                    // Try to find and link the existing user
                    const { data: users } = await supabase.auth.admin.listUsers();
                    const existingUser = users?.users?.find(u => u.email === email);

                    if (existingUser) {
                        const { error: updateError } = await supabase
                            .from('executing_agencies')
                            .update({ user_id: existingUser.id })
                            .eq('id', agency.id);

                        if (!updateError) {
                            console.log(`  → Linked existing user to agency`);
                        }
                    }
                } else {
                    console.log(`✗ ERROR: ${agencyName} (${email}) - ${authError.message}`);
                    errorCount++;
                }
                continue;
            }

            // Update agency with user_id
            const { error: updateError } = await supabase
                .from('executing_agencies')
                .update({ user_id: authData.user.id })
                .eq('id', agency.id);

            if (updateError) {
                console.log(`✓ CREATED USER: ${agencyName} (${email})`);
                console.log(`  ⚠ Warning: Could not link user to agency - ${updateError.message}`);
                errorCount++;
            } else {
                console.log(`✓ CREATED: ${agencyName} (${email})`);
                createdCount++;
            }
        }

        console.log('='.repeat(80));
        console.log('\nSummary:');
        console.log(`  ✓ New users created: ${createdCount}`);
        console.log(`  ✓ Users already existed: ${alreadyExistsCount}`);
        console.log(`  ✗ Errors: ${errorCount}`);
        console.log(`  Total agencies: ${agencies.length}`);
        console.log(`  Total users (created + existing): ${createdCount + alreadyExistsCount}`);

        if (createdCount + alreadyExistsCount === 72) {
            console.log('\n🎉 SUCCESS! All 72 executing agencies now have user accounts!');
            console.log(`   Password for all accounts: ${password}`);
        } else if (createdCount + alreadyExistsCount === agencies.length) {
            console.log(`\n✓ All ${agencies.length} executing agencies now have user accounts!`);
            console.log(`   Password for all accounts: ${password}`);
        } else {
            console.log(`\n⚠ Note: ${agencies.length - (createdCount + alreadyExistsCount)} agencies still need user accounts.`);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

setupAllExecutingAgencyUsers();
