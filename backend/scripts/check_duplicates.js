const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' }); // Try loading from parent .env first which is common in this setup
// process.env.SUPABASE_URL might be set from the file
// If not, try loading from local .env
if (!process.env.SUPABASE_URL) {
    require('dotenv').config();
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    console.log(`\nChecking table: ${tableName}`);
    const { data, error } = await supabase
        .from(tableName)
        .select('*');

    if (error) {
        console.log(`Error reading ${tableName}: ${error.message} (Table might not exist)`);
        return;
    }

    console.log(`Found ${data.length} rows in ${tableName}`);

    // Check for "leela"
    const leelas = data.filter(r => r.admin_name && r.admin_name.toLowerCase().includes('leela'));
    if (leelas.length > 0) {
        console.log(`Found ${leelas.length} entries for "leela" in ${tableName}:`);
        leelas.forEach(l => {
            console.log(` - ID: ${l.id}, State: ${l.state_name}, Name: ${l.admin_name}, Phone: ${l.phone_no}, Email: ${l.email}`);
        });
    } else {
        console.log(`No entries found for "leela" in ${tableName}`);
    }
}

async function main() {
    await checkTable('state_admins');
    await checkTable('state_assignment');
}

main();
