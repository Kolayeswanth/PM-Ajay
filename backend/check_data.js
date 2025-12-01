const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking district_proposals data...');
    const { data, error } = await supabase
        .from('district_proposals')
        .select('id, project_name, created_at')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data sample:', data);
    }
}

checkData();
