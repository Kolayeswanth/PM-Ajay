
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJoin() {
    console.log('Checking join...');
    const { data, error } = await supabase
        .from('district_proposals')
        .select(`
            id,
            project_name,
            status,
            districts (
                name,
                states (
                    name
                )
            )
        `)
        .limit(2);

    if (error) console.error(error);
    else {
        console.log(JSON.stringify(data, null, 2));
    }
}

checkJoin();
