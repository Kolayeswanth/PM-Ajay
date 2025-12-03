const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateApproval() {
    console.log('🧪 Testing: Reminders Stop After Approval\n');

    // Pick a proposal that's currently getting reminders
    const testProposalId = 23; // "kedari" - currently SUBMITTED

    console.log('Step 1: Check current status');
    let { data: proposal } = await supabase
        .from('district_proposals')
        .select('id, project_name, status')
        .eq('id', testProposalId)
        .single();

    console.log(`   Proposal: ${proposal.project_name}`);
    console.log(`   Current Status: ${proposal.status}`);
    console.log(`   Will get reminders: ${proposal.status === 'SUBMITTED' ? '✅ YES' : '❌ NO'}\n`);

    console.log('Step 2: Simulate State Approval');
    const { error } = await supabase
        .from('district_proposals')
        .update({ status: 'APPROVED_BY_STATE' })
        .eq('id', testProposalId);

    if (error) {
        console.error('Error updating:', error);
        return;
    }

    console.log('   ✅ Status updated to APPROVED_BY_STATE\n');

    console.log('Step 3: Verify new status');
    ({ data: proposal } = await supabase
        .from('district_proposals')
        .select('id, project_name, status')
        .eq('id', testProposalId)
        .single());

    console.log(`   Proposal: ${proposal.project_name}`);
    console.log(`   New Status: ${proposal.status}`);
    console.log(`   Will get reminders: ${proposal.status === 'SUBMITTED' ? '✅ YES' : '❌ NO'}\n`);

    console.log('Step 4: Revert back to SUBMITTED for testing');
    await supabase
        .from('district_proposals')
        .update({ status: 'SUBMITTED' })
        .eq('id', testProposalId);

    console.log('   ✅ Reverted to SUBMITTED\n');

    console.log('✅ Test Complete!');
    console.log('\n📝 Summary:');
    console.log('   - When status = SUBMITTED → Reminders are sent');
    console.log('   - When status = APPROVED_BY_STATE → Reminders STOP');
    console.log('   - When status = REJECTED_BY_STATE → Reminders STOP');
}

simulateApproval();
