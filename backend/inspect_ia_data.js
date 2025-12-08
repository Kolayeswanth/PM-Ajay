const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findSimilar() {
    console.log('Searching for agencies with "Karnataka" in name...\n');

    const { data, error } = await supabase
        .from('implementing_agencies')
        .select('*')
        .ilike('agency_name', '%Karnataka%')
        .limit(10);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data ? data.length : 0} matches:`);
        if (data) {
            data.forEach(a => {
                console.log(`- [${a.id}] ${a.agency_name} | Email: ${a.email} | State: ${a.state}`);
            });
        }
    }
}

findSimilar();
