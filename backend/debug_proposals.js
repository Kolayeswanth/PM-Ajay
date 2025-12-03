const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAll() {
    console.log('--- Checking All Submitted Proposals ---');

    const { data: proposals, error } = await supabase
        .from('district_proposals')
        .select('id, project_name, status, district_id')
        .eq('status', 'SUBMITTED');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (proposals.length === 0) {
        console.log('No SUBMITTED proposals found.');
        return;
    }

    console.log(`Found ${proposals.length} SUBMITTED proposals.`);

    for (const p of proposals) {
        // Get District & State
        const { data: district } = await supabase
            .from('districts')
            .select('name, state_id, states(name)')
            .eq('id', p.district_id)
            .single();

        if (district) {
            // Find State Admin
            const { data: admin } = await supabase
                .from('state_assignment')
                .select('admin_name, phone_no')
                .ilike('state_name', district.states.name)
                .eq('status', 'Activated')
                .single();

            const adminInfo = admin ? `Admin: ${admin.admin_name} (${admin.phone_no})` : '❌ No Active Admin';
            console.log(`- [${p.id}] ${p.project_name} (${district.states.name}) -> ${adminInfo}`);
        } else {
            console.log(`- [${p.id}] ${p.project_name} -> District not found`);
        }
    }
}

debugAll();
