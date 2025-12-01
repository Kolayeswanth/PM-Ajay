
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAssignProjects() {
    console.log('--- Verifying Assign Projects Logic ---');

    // 1. Get an Implementing Agency
    const { data: iaData, error: iaError } = await supabase
        .from('implementing_agencies')
        .select('user_id, state_name')
        .not('state_name', 'is', null)
        .limit(1)
        .single();

    if (iaError || !iaData) {
        console.error('Error fetching IA:', iaError);
        return;
    }

    const { user_id, state_name } = iaData;
    console.log(`User State: ${state_name}`);

    // 2. Fetch Unassigned Projects (Mock check)
    // We check if 'works' table exists and has records with null executing_agency_id
    const { data: worksData, error: worksError } = await supabase
        .from('works')
        .select('id, work_name, title')
        .is('executing_agency_id', null)
        .limit(5);

    if (worksError) {
        console.error('Error fetching works:', worksError);
    } else {
        console.log(`Found ${worksData.length} unassigned projects.`);
        worksData.forEach(w => console.log(`- ${w.work_name || w.title}`));
    }

    // 3. Fetch Executing Agencies for the State
    const { data: eaData, error: eaError } = await supabase
        .from('executing_agencies')
        .select('agency_name')
        .eq('state_name', state_name)
        .limit(5);

    if (eaError) {
        console.error('Error fetching EAs:', eaError);
    } else {
        console.log(`Found ${eaData.length} agencies in ${state_name}:`);
        eaData.forEach(ea => console.log(`- ${ea.agency_name}`));
    }
}

verifyAssignProjects();
