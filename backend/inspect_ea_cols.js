require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('Inspecting keys...');
    const { data, error } = await supabase
        .from('executing_agencies')
        .select('*')
        .limit(1);

    if (data && data.length > 0) {
        Object.keys(data[0]).forEach(key => console.log(key));
    }
}

inspect();
