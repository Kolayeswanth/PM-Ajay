const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateColumns() {
    console.log('Starting population of user_id and state columns...');

    // 1. Fetch all states to create a map
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

    // 2. Fetch all implementing agencies
    const { data: agencies, error: agenciesError } = await supabase
        .from('implementing_agencies')
        .select('*');

    if (agenciesError) {
        console.error('Error fetching agencies:', agenciesError);
        return;
    }

    console.log(`Found ${agencies.length} agencies.`);

    // 3. Loop and update
    let updatedCount = 0;
    let errorCount = 0;

    for (const agency of agencies) {
        let updates = {};

        // Find state name
        if (agency.state_id && stateMap[agency.state_id]) {
            updates.state = stateMap[agency.state_id];
        }

        // Find user_id from auth.users (Need admin access? We have service role key, so we can access auth.users via admin api if needed, or by selecting)
        // Wait, supabase-js admin API:
        if (agency.email) {
            // We can't query auth.users directly via .from('auth.users') usually, we use auth.admin
            // But checking if 'user_id' is already there is good, but we want to FILL it.
            // Let's try to get user by email
            const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
            // listUsers might be paginated, getting all users might be slow if many. 
            // Better to find specific user? listUsers doesn't support filter by email easily in all versions? 
            // Actually it does not filter by email directly in listUsers(params).
            // But we have `setup_all_agency_users.js` which did this. 
            // It iterated agencies, tried `createUser`, if exists, listed users.

            // Optimisation: Get all users once (assuming < 1000 for now or paging)
            // or just loop and look up? 
            // Since we have around 72 agencies, and maybe equivalent users, fetching all users is fine if < 1000.

        }
    }

    // Better approach: fetch all users once
    console.log('Fetching all users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }

    const emailToUserId = {};
    users.forEach(u => {
        if (u.email) emailToUserId[u.email.toLowerCase()] = u.id;
    });

    for (const agency of agencies) {
        let updates = {};
        let needsUpdate = false;

        // State update
        const stateName = stateMap[agency.state_id];
        if (stateName && agency.state !== stateName) {
            updates.state = stateName;
            needsUpdate = true;
        }

        // User ID update
        if (agency.email) {
            const uid = emailToUserId[agency.email.toLowerCase()];
            if (uid && agency.user_id !== uid) {
                updates.user_id = uid;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('implementing_agencies')
                .update(updates)
                .eq('id', agency.id);

            if (updateError) {
                console.error(`Failed to update agency ${agency.agency_name}:`, updateError.message);
                errorCount++;
            } else {
                console.log(`Updated ${agency.agency_name}: Set state='${updates.state || 'same'}', user_id='${updates.user_id || 'same'}'`);
                updatedCount++;
            }
        }
    }

    console.log(`\nFinished. Updated: ${updatedCount}, Errors: ${errorCount}`);
}

populateColumns();
