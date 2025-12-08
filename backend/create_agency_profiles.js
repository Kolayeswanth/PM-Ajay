const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAgencyProfiles() {
    try {
        console.log('Starting profile creation for implementing agencies...\n');

        // 1. Fetch all implementing agencies
        const { data: agencies, error: agenciesError } = await supabase
            .from('implementing_agencies')
            .select('*')
            .order('id');

        if (agenciesError) {
            console.error('Error fetching agencies:', agenciesError);
            return;
        }

        console.log(`Found ${agencies.length} agencies.`);
        const password = 'Test123!';

        // 2. Iterate and process
        let createdCount = 0;
        let linkedCount = 0;
        let errorCount = 0;
        let profileCreatedCount = 0;

        for (const agency of agencies) {
            const email = agency.email;
            const agencyName = agency.agency_name;

            if (!email) {
                console.log(`SKIP: ${agencyName} - No email`);
                continue;
            }

            let userId = agency.user_id;

            // 3. Ensure User Exists
            if (!userId) {
                // Try to find user by email first (admin API)
                // Note: listUsers is not efficient for single lookup by email in loop if excessive, 
                // but acceptable for ~400 items or use create to check duplicates.

                // Approach: Try create, if fails catch "already registered"
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: email,
                    password: password,
                    email_confirm: true,
                    user_metadata: {
                        role: 'implementing_agency',
                        agency_name: agencyName
                    }
                });

                if (authError) {
                    if (authError.message.includes('already registered') || authError.status === 422) {
                        // User exists, find ID
                        // We need to list users to find the ID if we don't have it.
                        // Ideally we fetched all users upfront.
                    } else {
                        console.error(`ERROR creating user for ${email}: ${authError.message}`);
                        errorCount++;
                        continue;
                    }
                } else {
                    userId = authData.user.id;
                    createdCount++;
                    console.log(`Created user for ${email}`);
                }
            }

            // If we still don't have userId (because it existed), we need to fetch it.
            if (!userId) {
                // Fetch user by email? 
                // Since createUser doesn't return ID if exists, we need another way.
                // Let's do a bulk fetch of users map beforehand or per iteration?
                // Per iteration is slow. Let's fetch all users upfront.
            }
        }
    } catch (e) {
        console.error("Critical error", e);
    }
}

// Rewriting function to be more efficient with bulk fetch
async function main() {
    console.log('Fetching all users...');
    let allUsers = [];
    let page = 1;
    let hasMore = true;

    // Fetch all users to map emails to IDs
    while (hasMore) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: page, perPage: 1000 });
        if (error) { console.error(error); break; }
        if (!users || users.length === 0) { hasMore = false; }
        else {
            allUsers = allUsers.concat(users);
            // If fewer than 1000 returned, we are done
            if (users.length < 1000) hasMore = false;
            page++;
        }
    }

    const emailToId = {};
    allUsers.forEach(u => emailToId[u.email.toLowerCase()] = u.id);
    console.log(`Fetched ${allUsers.length} existing users.`);

    // Fetch Agnecies
    const { data: agencies, error: agErr } = await supabase
        .from('implementing_agencies')
        .select('*');

    if (agErr) { console.error(agErr); return; }

    const password = 'Test123!';
    let stats = { created: 0, profiles: 0, linked: 0, errors: 0 };

    for (const agency of agencies) {
        if (!agency.email) continue;
        const email = agency.email.toLowerCase();
        let userId = emailToId[email];

        // 1. Create User if missing
        if (!userId) {
            const { data: newData, error: createErr } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    role: 'implementing_agency',
                    full_name: agency.agency_name
                }
            });

            if (createErr) {
                console.error(`Error creating user ${email}: ${createErr.message}`);
                stats.errors++;
                continue;
            }
            userId = newData.user.id;
            stats.created++;
            console.log(`Created User: ${email}`);
        }

        // 2. Create/Update Profile
        // We need to upsert into profiles.
        const profileData = {
            id: userId,
            email: email,
            role: 'implementing_agency',
            full_name: agency.agency_name,
            updated_at: new Date()
        };

        const { error: profError } = await supabase
            .from('profiles')
            .upsert(profileData);

        if (profError) {
            console.error(`Error upserting profile for ${email}: ${profError.message}`);
            stats.errors++;
        } else {
            stats.profiles++;
        }

        // 3. Link back to implementing_agencies if needed
        if (agency.user_id !== userId) {
            const { error: linkErr } = await supabase
                .from('implementing_agencies')
                .update({ user_id: userId })
                .eq('id', agency.id);

            if (linkErr) {
                console.error(`Error linking agency ${agency.id}: ${linkErr.message}`);
                stats.errors++;
            } else {
                stats.linked++;
            }
        }
    }

    console.log('------------------------------------------------');
    console.log('Execution Summary:');
    console.log(`Users Created: ${stats.created}`);
    console.log(`Profiles Upserted: ${stats.profiles}`);
    console.log(`Agencies Linked to UserID: ${stats.linked}`);
    console.log(`Errors: ${stats.errors}`);
}

main();
