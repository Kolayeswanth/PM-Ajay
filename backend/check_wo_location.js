
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLocation() {
    console.log('--- Checking work_orders location ---');

    const { error: locError } = await supabase.from('work_orders').select('location').limit(1);
    if (locError) console.log('Location Error:', locError.message);
    else console.log('Location exists');

    const { error: distError } = await supabase.from('work_orders').select('district').limit(1);
    if (distError) console.log('District Error:', distError.message);
    else console.log('District exists');
}

checkLocation();
