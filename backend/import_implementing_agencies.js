const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple CSV parser
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || null;
        });

        data.push(row);
    }

    return data;
}

async function importImplementingAgenciesFromCSV(csvFilePath) {
    try {
        console.log('╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  IMPORTING IMPLEMENTING AGENCIES FROM CSV                             ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

        // Check if file exists
        if (!fs.existsSync(csvFilePath)) {
            console.error(`✗ Error: File not found: ${csvFilePath}`);
            console.log('\nPlease provide the full path to your CSV file.');
            console.log('Example: node import_implementing_agencies.js agencies.csv');
            return;
        }

        // Read CSV file
        console.log(`📂 Reading CSV file: ${csvFilePath}\n`);
        const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

        // Parse CSV
        const agencies = parseCSV(csvContent);
        console.log(`✓ Parsed ${agencies.length} agencies from CSV\n`);

        if (agencies.length === 0) {
            console.log('✗ No data found in CSV file');
            return;
        }

        // Show sample of first record
        console.log('Sample record (first row):');
        console.log(JSON.stringify(agencies[0], null, 2));
        console.log('');

        // Map CSV columns to database columns
        // Expected CSV columns: agency_name, email, state_id, district_id, etc.
        console.log('📋 Preparing data for import...\n');

        const dataToInsert = agencies.map(agency => {
            return {
                agency_name: agency.agency_name || agency.name,
                email: agency.email,
                state_id: agency.state_id ? parseInt(agency.state_id) : null,
                district_id: agency.district_id ? parseInt(agency.district_id) : null,
                agency_type: agency.agency_type || 'Government',
                registration_no: agency.registration_no,
                address: agency.address,
                contact_number: agency.contact_number,
                status: agency.status || 'Active'
            };
        });

        // Insert in batches
        console.log('💾 Inserting agencies into database...\n');
        console.log('='.repeat(80));

        const batchSize = 50;
        let insertedCount = 0;
        let errorCount = 0;

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
                errorCount += batch.length;
            } else {
                console.log(`  ✓ Inserted ${batch.length} agencies`);
                insertedCount += batch.length;
            }
        }

        console.log('='.repeat(80));
        console.log(`\n✅ Import Summary:`);
        console.log(`   Total in CSV: ${agencies.length}`);
        console.log(`   Successfully inserted: ${insertedCount}`);
        console.log(`   Errors: ${errorCount}`);

        // Verify final count
        const { data: finalCount } = await supabase
            .from('implementing_agencies')
            .select('*', { count: 'exact', head: true });

        console.log(`\n📊 Database Status:`);
        console.log(`   Total implementing agencies in database: ${finalCount?.length || 'unknown'}`);

        console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
        console.log('║  ✅ IMPORT COMPLETE                                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Get CSV file path from command line argument
const csvFilePath = process.argv[2];

if (!csvFilePath) {
    console.log('Usage: node import_implementing_agencies.js <path-to-csv-file>');
    console.log('Example: node import_implementing_agencies.js agencies.csv');
    console.log('\nExpected CSV format:');
    console.log('agency_name,email,state_id,district_id,agency_type,registration_no,address,contact_number,status');
    process.exit(1);
}

importImplementingAgenciesFromCSV(csvFilePath);
