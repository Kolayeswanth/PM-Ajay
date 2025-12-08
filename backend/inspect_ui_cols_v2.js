require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Inspecting implementing_agencies...');
    const { data: ia, error: iaError } = await supabase
        .from('implementing_agencies')
        .select('*')
        .limit(1);

    if (iaError) console.error(iaError);
    else {
        if (ia.length > 0) {
            console.log('IA Columns:', Object.keys(ia[0]));
        } else {
            console.log('IA table is empty?');
            // fetch column definition if empty
            // but we know it's not empty
        }
    }
}

inspect();
