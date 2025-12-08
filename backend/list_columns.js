const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data: sample, error } = await supabase
        .from('implementing_agencies')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (sample && sample.length > 0) {
        console.log('Columns:', Object.keys(sample[0]));
    } else {
        console.log('No data');
    }
}

inspect();
