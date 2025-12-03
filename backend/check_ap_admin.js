const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStateAdmin() {
    console.log('--- Checking State Admin for Andhra Pradesh ---');

    // 1. Check what's in state_assignment for Andhra Pradesh
    const { data: admins, error } = await supabase
        .from('state_assignment')
        .select('*')
        .ilike('state_name', '%Andhra%');

    if (error) {
        console.error('Error fetching admins:', error);
        return;
    }

    console.log(`Found ${admins.length} entries for Andhra Pradesh:`);
    admins.forEach(a => {
        console.log(`- ID: ${a.id}`);
        console.log(`  Name: ${a.admin_name}`);
        console.log(`  State: '${a.state_name}'`); // Quotes to see trailing spaces
        console.log(`  Status: '${a.status}'`);
        console.log(`  Phone: ${a.phone_no}`);
    });
}

checkStateAdmin();
