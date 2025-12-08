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
    else console.log('IA Columns:', Object.keys(ia[0] || {}));

    console.log('\nInspecting work_orders...');
    const { data: wo, error: woError } = await supabase
        .from('work_orders')
        .select('*')
        .limit(1);

    if (woError) console.error(woError);
    else console.log('Work Order Columns:', Object.keys(wo[0] || {}));
}

inspect();
