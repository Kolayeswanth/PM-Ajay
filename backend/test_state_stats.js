const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStateStats() {
    const stateName = 'Andhra Pradesh';

    console.log('Testing state stats for:', stateName);

    // Test 1: Get state
    const { data: stateData, error: stateError } = await supabase
        .from('states')
        .select('id')
        .eq('name', stateName)
        .single();

    console.log('\n1. State lookup:', { stateData, stateError });

    // Test 2: Get fund allocations with join
    const { data: fundAllocations, error: allocError } = await supabase
        .from('fund_allocations')
        .select('amount_cr, amount_rupees, states!inner(name)')
        .eq('states.name', stateName);

    console.log('\n2. Fund allocations (with join):', { fundAllocations, allocError });

    // Test 3: Alternative - get by state_id if join doesn't work
    if (stateData) {
        const { data: fundAllocations2, error: allocError2 } = await supabase
            .from('fund_allocations')
            .select('amount_cr, amount_rupees, state_id')
            .eq('state_id', stateData.id);

        console.log('\n3. Fund allocations (by state_id):', { fundAllocations2, allocError2 });
    }
}

testStateStats();
