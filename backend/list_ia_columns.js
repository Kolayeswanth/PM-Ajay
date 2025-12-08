require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Listing all columns of implementing_agencies...');
    const { data, error } = await supabase
        .from('implementing_agencies')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        // Table might be empty, try to get definition another way or insert a dummy row (not safe). 
        // Or assume if empty we can't inspect keys from data. 
        // But we know it has data (10 karnataka agencies).
        console.log('No data found to inspect columns.');
    }
}

inspect();
