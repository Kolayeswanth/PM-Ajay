const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkEmail() {
    const { data, error } = await supabase
        .from('implementing_agencies')
        .select('email')
        .limit(1);

    if (error) {
        console.log('Error selecting email:', error.message);
    } else {
        console.log('Email column exists. Data:', data);
    }
}

checkEmail();
