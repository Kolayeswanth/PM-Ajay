const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const states_uts = [
    ["Andhra Pradesh", "AP", "Amaravati"],
    ["Arunachal Pradesh", "AR", "Itanagar"],
    ["Assam", "AS", "Dispur"],
    ["Bihar", "BR", "Patna"],
    ["Chhattisgarh", "CG", "Raipur"],
    ["Goa", "GA", "Panaji"],
    ["Gujarat", "GJ", "Gandhinagar"],
    ["Haryana", "HR", "Chandigarh"],
    ["Himachal Pradesh", "HP", "Shimla"],
    ["Jharkhand", "JH", "Ranchi"],
    ["Karnataka", "KA", "Bengaluru"],
    ["Kerala", "KL", "Thiruvananthapuram"],
    ["Madhya Pradesh", "MP", "Bhopal"],
    ["Maharashtra", "MH", "Mumbai"],
    ["Manipur", "MN", "Imphal"],
    ["Meghalaya", "ML", "Shillong"],
    ["Mizoram", "MZ", "Aizawl"],
    ["Nagaland", "NL", "Kohima"],
    ["Odisha", "OD", "Bhubaneswar"],
    ["Punjab", "PB", "Chandigarh"],
    ["Rajasthan", "RJ", "Jaipur"],
    ["Sikkim", "SK", "Gangtok"],
    ["Tamil Nadu", "TN", "Chennai"],
    ["Telangana", "TG", "Hyderabad"],
    ["Tripura", "TR", "Agartala"],
    ["Uttar Pradesh", "UP", "Lucknow"],
    ["Uttarakhand", "UK", "Dehradun"],
    ["West Bengal", "WB", "Kolkata"],
    ["Andaman and Nicobar Islands", "AN", "Port Blair"],
    ["Chandigarh", "CH", "Chandigarh"],
    ["Dadra and Nagar Haveli and Daman and Diu", "DD", "Daman"],
    ["Delhi", "DL", "New Delhi"],
    ["Jammu and Kashmir", "JK", "Srinagar"],
    ["Ladakh", "LA", "Leh"],
    ["Lakshadweep", "LD", "Kavaratti"],
    ["Puducherry", "PY", "Puducherry"],
];

const agency_types = ["NGO", "NOD", "TEC", "PWD", "NODAL", "PSU", "STA"];

async function create360ImplementingAgencies() {
    try {
        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  CREATING 360 IMPLEMENTING AGENCIES (36 States × 10 Agencies)        ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // Generate all agencies data
        const data = [];

        for (let idx = 0; idx < states_uts.length; idx++) {
            const [state, code, capital] = states_uts[idx];

            for (let num = 1; num <= 10; num++) {
                const agency_type = agency_types[(num - 1) % agency_types.length];
                const agency_name = `GOV - ${state} ${agency_type} Agency ${num.toString().padStart(2, '0')}`;
                const reg_no = `REG-${code}-${(idx + 1).toString().padStart(2, '0')}${num.toString().padStart(2, '0')}`;
                const address = `${100 + num} Welfare St, ${capital}`;
                const contact = (9000000000 + (idx + 1) * 100 + num).toString();
                const email = `ia.${state.toLowerCase().replace(/\s+/g, '-')}.${num}@pmajay.in`;

                const row = {
                    agency_name: agency_name,
                    agency_type: agency_type,
                    registration_no: reg_no,
                    address: address,
                    contact_number: contact,
                    email: email,
                    state_id: idx + 1,
                    district_id: idx + 1
                };

                data.push(row);
            }
        }

        console.log(`📋 Generated ${data.length} implementing agencies\n`);
        console.log('Sample (first 3 records):');
        console.log(JSON.stringify(data.slice(0, 3), null, 2));
        console.log('');

        // Insert in batches
        console.log('💾 Inserting agencies into database...\n');
        console.log('='.repeat(80));

        const batchSize = 50;
        let insertedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(data.length / batchSize);

            console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

            const { data: inserted, error } = await supabase
                .from('implementing_agencies')
                .insert(batch)
                .select();

            if (error) {
                console.log(`  ✗ Error in batch ${batchNum}: ${error.message}`);
                errorCount += batch.length;
            } else {
                console.log(`  ✓ Inserted ${batch.length} agencies`);
                insertedCount += batch.length;
            }
        }

        console.log('='.repeat(80));
        console.log(`\n✅ Import Summary:`);
        console.log(`   Total generated: ${data.length}`);
        console.log(`   Successfully inserted: ${insertedCount}`);
        console.log(`   Errors: ${errorCount}`);

        // Verify final count
        const { data: finalAgencies } = await supabase
            .from('implementing_agencies')
            .select('*');

        console.log(`\n📊 Database Status:`);
        console.log(`   Total implementing agencies in database: ${finalAgencies.length}`);

        // Show breakdown by state
        const byState = {};
        finalAgencies.forEach(a => {
            if (!byState[a.state_id]) byState[a.state_id] = 0;
            byState[a.state_id]++;
        });

        console.log(`\n📈 Breakdown:`);
        console.log(`   States represented: ${Object.keys(byState).length}`);
        console.log(`   Average agencies per state: ${(finalAgencies.length / Object.keys(byState).length).toFixed(1)}`);

        console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  ✅ IMPORT COMPLETE                                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        if (insertedCount === 360) {
            console.log('🎉 SUCCESS! All 360 implementing agencies created!\n');
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

create360ImplementingAgencies();
