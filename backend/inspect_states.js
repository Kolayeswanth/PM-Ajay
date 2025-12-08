const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectStates() {
    const { data: sample, error } = await supabase
        .from('states')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching states:', error);
    } else {
        console.log('States columns:', Object.keys(sample[0]));
    }
}

inspectStates();
