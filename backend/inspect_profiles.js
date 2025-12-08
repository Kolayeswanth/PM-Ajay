const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProfiles() {
    const { data: sample, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        if (sample && sample.length > 0) {
            console.log('Profiles columns:', Object.keys(sample[0]));
            // Check content of one profile
            console.log('Sample profile:', sample[0]);
        } else {
            console.log('No profiles found, but table likely exists.');
            // Insert dummy to check error? No, safer to assume standard columns or check migrations if available
        }
    }
}

inspectProfiles();
