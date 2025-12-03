const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProposals() {
    const { data: proposals, error } = await supabase
        .from('district_proposals')
        .select('id, project_name, status, district_id');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('All Proposals:');
    proposals.forEach(p => {
        console.log(`- ID: ${p.id}, Name: ${p.project_name}, Status: ${p.status}`);
    });
}

checkProposals();
