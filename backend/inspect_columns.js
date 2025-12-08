const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Inspecting columns...');

    const { data: sample, error } = await supabase
        .from('implementing_agencies')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching sample:', error);
        return;
    }

    if (sample && sample.length > 0) {
        const keys = Object.keys(sample[0]);
        console.log('Keys found:');
        keys.forEach(k => console.log(` - ${k}`));

        const hasUserId = keys.includes('user_id');
        const hasState = keys.includes('state');

        if (hasUserId) {
            const { count } = await supabase
                .from('implementing_agencies')
                .select('*', { count: 'exact', head: true })
                .is('user_id', null);
            console.log(`Rows with NULL user_id: ${count}`);
        }

        if (hasState) {
            const { count } = await supabase
                .from('implementing_agencies')
                .select('*', { count: 'exact', head: true })
                .is('state', null);
            console.log(`Rows with NULL state: ${count}`);
        }
    } else {
        console.log('No rows found.');
    }
}

inspect();
