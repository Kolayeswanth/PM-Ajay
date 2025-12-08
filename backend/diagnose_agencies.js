const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDistribution() {
    console.log('🔍 Checking Agency Distribution...\n');

    try {
        // 1. Check Implementing Agencies
        console.log('--- Implementing Agencies ---');
        const { data: ias, error: iaError } = await supabase
            .from('implementing_agencies')
            .select('id, state_name, district_name');

        if (iaError) console.error(iaError);
        else {
            console.log(`Total IAs: ${ias.length}`);
            const iaDistCounts = {};
            const iaStateCounts = {};
            let nullDistricts = 0;

            ias.forEach(a => {
                if (a.district_name) {
                    const key = `${a.district_name}, ${a.state_name}`;
                    iaDistCounts[key] = (iaDistCounts[key] || 0) + 1;
                } else {
                    nullDistricts++;
                    iaStateCounts[a.state_name] = (iaStateCounts[a.state_name] || 0) + 1;
                }
            });

            console.log(`IAs with District: ${ias.length - nullDistricts}`);
            console.log(`IAs without District (State level): ${nullDistricts}`);

            if (Object.keys(iaDistCounts).length > 0) {
                console.log('Sample District Counts (IA):', Object.entries(iaDistCounts).slice(0, 5));
            }
            console.log('Sample State Counts (IA):', Object.entries(iaStateCounts).slice(0, 5));
        }

        // 2. Check Executing Agencies
        console.log('\n--- Executing Agencies ---');
        const { data: eas, error: eaError } = await supabase
            .from('executing_agencies')
            .select('id, state_name, district_name');

        if (eaError) console.error(eaError);
        else {
            console.log(`Total EAs: ${eas.length}`);
            const eaDistCounts = {};
            eas.forEach(a => {
                const key = `${a.district_name}, ${a.state_name}`;
                eaDistCounts[key] = (eaDistCounts[key] || 0) + 1;
            });

            console.log('Sample District Counts (EA):', Object.entries(eaDistCounts).slice(0, 5));
        }

    } catch (err) {
        console.error(err);
    }
}

checkDistribution();
