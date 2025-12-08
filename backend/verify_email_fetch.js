const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const email = 'nod-karnataka95@nic.in';

async function checkEmailFetch() {
    console.log(`Fetching agency by email: ${email}...\n`);

    const { data, error } = await supabase
        .from('implementing_agencies')
        .select('id, agency_name, state, email')
        .ilike('email', email);

    if (error) {
        console.error('Error fetching by email:', error);
    } else {
        console.log('Found agencies:', data.length);
        if (data.length > 0) {
            console.log('First match:', data[0]);
            if (data[0].state) {
                console.log('✅ State column is readable:', data[0].state);
            } else {
                console.log('❌ State column is NULL or empty.');
            }
        } else {
            console.log('❌ No agency found with this email.');
        }
    }
}

checkEmailFetch();
