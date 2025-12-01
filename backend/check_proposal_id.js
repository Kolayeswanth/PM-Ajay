
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProposalId() {
    console.log('--- Checking work_orders for proposal_id ---');

    const { error: propError } = await supabase.from('work_orders').select('proposal_id').limit(1);
    if (propError) console.log('Proposal ID Error:', propError.message);
    else console.log('proposal_id exists');
}

checkProposalId();
