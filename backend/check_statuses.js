const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatuses() {
    console.log('--- All Proposal Statuses ---\n');

    const { data: proposals } = await supabase
        .from('district_proposals')
        .select('id, project_name, status')
        .order('id');

    // Group by status
    const grouped = {};
    proposals.forEach(p => {
        if (!grouped[p.status]) grouped[p.status] = [];
        grouped[p.status].push(`[${p.id}] ${p.project_name}`);
    });

    Object.keys(grouped).sort().forEach(status => {
        console.log(`\n📌 Status: ${status}`);
        console.log(`   Count: ${grouped[status].length}`);
        grouped[status].forEach(p => console.log(`   - ${p}`));
    });

    console.log('\n\n🔔 REMINDER LOGIC:');
    console.log('   ✅ Sends reminders ONLY for: SUBMITTED');
    console.log('   ❌ Stops reminders when status changes to:');
    console.log('      - APPROVED_BY_STATE');
    console.log('      - REJECTED_BY_STATE');
    console.log('      - APPROVED_BY_MINISTRY');
    console.log('      - REJECTED_BY_MINISTRY');
    console.log('      - ASSIGNED');
    console.log('      - Any other status');
}

checkStatuses();
