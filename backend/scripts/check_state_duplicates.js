const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
if (!process.env.SUPABASE_URL) require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStateDuplicates() {
    console.log('Checking for duplicate admins per state in state_assignment...');

    // Get all admins
    const { data: admins, error } = await supabase
        .from('state_assignment')
        .select('*')
        .order('state_name');

    if (error) {
        console.error('Error:', error);
        return;
    }

    const stateMap = {};
    admins.forEach(admin => {
        if (!stateMap[admin.state_name]) {
            stateMap[admin.state_name] = [];
        }
        stateMap[admin.state_name].push(admin);
    });

    let duplicatesFound = false;
    for (const [state, adminList] of Object.entries(stateMap)) {
        if (adminList.length > 1) {
            duplicatesFound = true;
            console.log(`\nState: ${state} has ${adminList.length} admins:`);
            adminList.forEach(a => {
                console.log(` - ID: ${a.id}, Name: ${a.admin_name}, Phone: ${a.phone_no}, Status: ${a.status}`);
            });
        }
    }

    if (!duplicatesFound) {
        console.log('\nNo duplicate states found.');
    }
}

checkStateDuplicates();
