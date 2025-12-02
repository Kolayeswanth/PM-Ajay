
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking tables...');

    const { count: states } = await supabase.from('states').select('*', { count: 'exact', head: true });
    console.log('States:', states);

    const { count: districts } = await supabase.from('districts').select('*', { count: 'exact', head: true });
    console.log('Districts:', districts);

    const { data: allocations } = await supabase.from('fund_allocations').select('amount_allocated');
    console.log('Allocations:', allocations);

    const { count: projects } = await supabase.from('district_proposals').select('*', { count: 'exact', head: true });
    console.log('Projects:', projects);
}

checkData();
