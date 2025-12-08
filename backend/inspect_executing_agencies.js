const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectExecutingAgenciesTable() {
    try {
        const { data, error } = await supabase
            .from('executing_agencies')
            .select('*')
            .limit(3);

        if (error) {
            console.error('Error:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('Columns:', Object.keys(data[0]).join(', '));
            console.log('\nFirst record:');
            for (const [key, value] of Object.entries(data[0])) {
                console.log(`  ${key}: ${value}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectExecutingAgenciesTable();
