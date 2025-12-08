const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    try {
        console.log('Inspecting implementing_agencies table...\n');

        // Fetch a sample record to see the structure
        const { data, error } = await supabase
            .from('implementing_agencies')
            .select('*')
            .limit(5);

        if (error) {
            console.error('Error fetching data:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('Sample record structure:');
            console.log(JSON.stringify(data[0], null, 2));
            console.log('\nColumn names:', Object.keys(data[0]));
            console.log('\nTotal records fetched:', data.length);

            console.log('\nAll sample records:');
            data.forEach((record, index) => {
                console.log(`\nRecord ${index + 1}:`, JSON.stringify(record, null, 2));
            });
        } else {
            console.log('No data found in the table');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

inspectTable();
