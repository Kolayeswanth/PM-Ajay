const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '01f1164e-cb12-4ed2-88dc-e3c191e2158a';
const email = 'nod-karnataka95@nic.in';
const stateName = 'Karnataka';

async function fixUserLink() {
    console.log(`Fixing link for user ${email} (ID: ${userId})...\n`);

    // 1. Try to find by email
    const { data: existing, error: findError } = await supabase
        .from('implementing_agencies')
        .select('*')
        .ilike('email', email)
        .limit(1);

    if (findError) {
        console.error('Error finding agency:', findError);
        return;
    }

    if (existing && existing.length > 0) {
        const agency = existing[0];
        console.log(`Found existing agency: ${agency.agency_name} (ID: ${agency.id})`);

        // Update user_id and state
        const { error: updateError } = await supabase
            .from('implementing_agencies')
            .update({
                user_id: userId,
                state: stateName
            })
            .eq('id', agency.id);

        if (updateError) {
            console.error('Error updating agency:', updateError);
        } else {
            console.log('✅ Successfully updated agency with user_id and state.');
        }

    } else {
        console.log('No existing agency found with this email. Creating new one...');

        const { error: insertError } = await supabase
            .from('implementing_agencies')
            .insert({
                agency_name: 'NOD Karnataka Agency',
                agency_type: 'NOD',
                email: email,
                state: stateName,
                user_id: userId,
                phone_no: '9999999999'
            });

        if (insertError) {
            console.error('Error creating agency:', insertError);
        } else {
            console.log('✅ Successfully created new agency linked to user.');
        }
    }
}

fixUserLink();
