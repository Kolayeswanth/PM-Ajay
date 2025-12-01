const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking district_proposals schema...');
    const { data, error } = await supabase
        .from('district_proposals')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('Table exists but is empty. Cannot infer columns from data.');
            // Try to insert a dummy row to see if it fails or what columns it expects? 
            // No, that's risky.
        }
    }
}

checkSchema();
