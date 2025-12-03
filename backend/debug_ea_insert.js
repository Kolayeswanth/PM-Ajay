const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCount() {
    console.log('Checking EA Count for Bangalore Urban...');

    const { count, error } = await supabase
        .from('executing_agencies')
        .select('*', { count: 'exact', head: true })
        .eq('district_name', 'Darrang');

    if (error) {
        console.error('Count Error:', error);
    } else {
        console.log(`Darrang has ${count} executing agencies.`);
    }
}

checkCount();
