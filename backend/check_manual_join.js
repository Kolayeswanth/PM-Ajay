
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkManualJoin() {
    console.log('Checking manual join logic...');

    // 1. Fetch proposals
    const { data: proposals } = await supabase
        .from('district_proposals')
        .select('*')
        .in('status', ['APPROVED_BY_STATE', 'APPROVED_BY_MINISTRY', 'REJECTED_BY_MINISTRY']);

    console.log(`Found ${proposals.length} proposals`);
    if (proposals.length === 0) return;

    // 2. Get unique District IDs
    const districtIds = [...new Set(proposals.map(p => p.district_id))];
    console.log('District IDs:', districtIds);

    // 3. Fetch Districts
    const { data: districts } = await supabase
        .from('districts')
        .select('id, name, state_id')
        .in('id', districtIds);

    console.log(`Found ${districts.length} districts`);

    // 4. Get unique State IDs
    const stateIds = [...new Set(districts.map(d => d.state_id))];
    console.log('State IDs:', stateIds);

    // 5. Fetch States
    const { data: states } = await supabase
        .from('states')
        .select('id, name')
        .in('id', stateIds);

    console.log(`Found ${states.length} states`);
    console.log('States:', states);
}

checkManualJoin();
