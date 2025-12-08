const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('Verifying Agency Profiles...\n');

    const { data: agencies, error } = await supabase
        .from('implementing_agencies')
        .select('id, agency_name, email, user_id, state');

    if (error) { console.error(error); return; }

    let missingUserIds = 0;
    let missingProfiles = 0;
    let mismatchProfiles = 0;
    let total = agencies.length;
    let checked = 0;

    for (const agency of agencies) {
        if (!agency.email) {
            // skip verification for those without email as we can't create users for them
            continue;
        }
        checked++;

        if (!agency.user_id) {
            console.log(`MISSING USER_ID: ${agency.agency_name} (${agency.email})`);
            missingUserIds++;
            continue;
        }

        // Check profile
        const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', agency.user_id)
            .single();

        if (profErr || !profile) {
            console.log(`MISSING PROFILE: ${agency.agency_name} (User: ${agency.user_id})`);
            missingProfiles++;
        } else {
            // Optional: Check data match
            if (profile.role !== 'implementing_agency') {
                console.log(`ROLE MISMATCH: ${agency.agency_name} has role ${profile.role}`);
                mismatchProfiles++;
            }
        }
    }

    console.log('\nVerification Results:');
    console.log(`Total Agencies: ${total}`);
    console.log(`Agencies with Email (Checked): ${checked}`);
    console.log(`Missing User IDs: ${missingUserIds}`);
    console.log(`Missing Profiles: ${missingProfiles}`);
    console.log(`Role Mismatches: ${mismatchProfiles}`);

    if (missingUserIds === 0 && missingProfiles === 0) {
        console.log('\nSUCCESS: All verifiable agencies have users and profiles.');
    } else {
        console.log('\nFAIL: Some agencies incomplete.');
    }
}

verify();
