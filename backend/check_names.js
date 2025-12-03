const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const stateName = 'Karnataka';

    const { data: dropdown } = await supabase
        .from('districts')
        .select('name')
        .eq('state_id', (await supabase.from('states').select('id').eq('name', stateName).single()).data.id)
        .order('name');

    const { data: projects } = await supabase
        .from('implementing_agencies')
        .select('district_name')
        .ilike('state_name', stateName);

    const dNames = dropdown.map(d => d.name);
    const pNames = [...new Set(projects.map(p => p.district_name))].sort();

    console.log('DROPDOWN:', JSON.stringify(dNames));
    console.log('PROJECTS:', JSON.stringify(pNames));
}

check();
