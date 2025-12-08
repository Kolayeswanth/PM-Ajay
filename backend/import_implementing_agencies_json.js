const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importImplementingAgenciesFromJSON(jsonFilePath) {
    try {
        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  IMPORTING IMPLEMENTING AGENCIES FROM JSON                            ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // Check if file exists
        if (!fs.existsSync(jsonFilePath)) {
            console.error(`✗ Error: File not found: ${jsonFilePath}`);
            console.log('\nPlease provide the full path to your JSON file.');
            console.log('Example: node import_implementing_agencies_json.js agencies.json');
            return;
        }

        // Read JSON file
        console.log(`📂 Reading JSON file: ${jsonFilePath}\n`);
        const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');

        // Parse JSON
        let agencies;
        try {
            const parsed = JSON.parse(jsonContent);
            // Handle both array and object with array property
            agencies = Array.isArray(parsed) ? parsed : (parsed.agencies || parsed.data || []);
        } catch (parseError) {
            console.error('✗ Error parsing JSON:', parseError.message);
            return;
        }

        console.log(`✓ Parsed ${agencies.length} agencies from JSON\n`);

        if (agencies.length === 0) {
            console.log('✗ No data found in JSON file');
            return;
        }

        // Show sample of first record
        console.log('Sample record (first item):');
        console.log(JSON.stringify(agencies[0], null, 2));
        console.log('');

        // Map JSON to database columns
        console.log('📋 Preparing data for import...\n');

        const dataToInsert = agencies.map(agency => {
            return {
                agency_name: agency.agency_name || agency.name || agency.agencyName,
                email: agency.email,
                state_id: agency.state_id || agency.stateId ? parseInt(agency.state_id || agency.stateId) : null,
                district_id: agency.district_id || agency.districtId ? parseInt(agency.district_id || agency.districtId) : null,
                agency_type: agency.agency_type || agency.agencyType || 'Government',
                registration_no: agency.registration_no || agency.registrationNo,
                address: agency.address,
                contact_number: agency.contact_number || agency.contactNumber || agency.phone,
                status: agency.status || 'Active'
            };
        });

        // Insert in batches
        console.log('💾 Inserting agencies into database...\n');
        console.log('='.repeat(80));

        const batchSize = 50;
        let insertedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < dataToInsert.length; i += batchSize) {
            const batch = dataToInsert.slice(i, i + batchSize);
            const batchNum = Math.floor(i / batchSize) + 1;
            const totalBatches = Math.ceil(dataToInsert.length / batchSize);

            console.log(`Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);

            const { data, error } = await supabase
                .from('implementing_agencies')
                .insert(batch)
                .select();

            if (error) {
                console.log(`  ✗ Error in batch ${batchNum}: ${error.message}`);
                errors.push({ batch: batchNum, error: error.message });
                errorCount += batch.length;
            } else {
                console.log(`  ✓ Inserted ${batch.length} agencies`);
                insertedCount += batch.length;
            }
        }

        console.log('='.repeat(80));
        console.log(`\n✅ Import Summary:`);
        console.log(`   Total in JSON: ${agencies.length}`);
        console.log(`   Successfully inserted: ${insertedCount}`);
        console.log(`   Errors: ${errorCount}`);

        if (errors.length > 0) {
            console.log(`\n⚠ Errors encountered:`);
            errors.forEach(e => {
                console.log(`   Batch ${e.batch}: ${e.error}`);
            });
        }

        // Verify final count
        const { data: finalAgencies } = await supabase
            .from('implementing_agencies')
            .select('*');

        console.log(`\n📊 Database Status:`);
        console.log(`   Total implementing agencies in database: ${finalAgencies.length}`);

        console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  ✅ IMPORT COMPLETE                                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Get JSON file path from command line argument
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
    console.log('Usage: node import_implementing_agencies_json.js <path-to-json-file>');
    console.log('Example: node import_implementing_agencies_json.js agencies.json');
    console.log('\nExpected JSON format (array):');
    console.log('[');
    console.log('  {');
    console.log('    "agency_name": "PWD Karnataka",');
    console.log('    "email": "pwd.karnataka@example.com",');
    console.log('    "state_id": 14,');
    console.log('    "district_id": 231,');
    console.log('    "agency_type": "Government",');
    console.log('    "registration_no": "REG001",');
    console.log('    "address": "Bangalore, Karnataka",');
    console.log('    "contact_number": "9876543210",');
    console.log('    "status": "Active"');
    console.log('  }');
    console.log(']');
    process.exit(1);
}

importImplementingAgenciesFromJSON(jsonFilePath);
