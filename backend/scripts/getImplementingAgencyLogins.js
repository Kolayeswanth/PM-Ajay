const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function getImplementingAgencyLogins() {
    try {
        console.log('🔍 Fetching Implementing Agency logins from database...\n');

        // Fetch all implementing agencies with minimal fields
        const { data: agencies, error } = await supabase
            .from('implementing_agencies')
            .select(`
                *,
                districts (
                    name,
                    states (
                        name
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error fetching agencies:', error);
            return;
        }

        if (!agencies || agencies.length === 0) {
            console.log('⚠️  No implementing agencies found in database.');
            return;
        }

        console.log(`✅ Found ${agencies.length} Implementing Agencies\n`);
        console.log('='.repeat(100));
        console.log('\n📋 IMPLEMENTING AGENCY LOGIN CREDENTIALS\n');
        console.log('='.repeat(100));

        agencies.forEach((agency, index) => {
            const stateName = agency.districts?.states?.name || 'N/A';
            const districtName = agency.districts?.name || 'N/A';

            console.log(`\n${index + 1}. ${agency.agency_name}`);
            console.log('   ' + '-'.repeat(80));
            console.log(`   📧 Email:    ${agency.email}`);
            console.log(`   🔑 Password: PMajay@2024#Demo`);
            console.log(`   📍 Location: ${districtName}, ${stateName}`);
            console.log(`   🆔 ID:       ${agency.id}`);
            console.log(`   📅 Created:  ${new Date(agency.created_at).toLocaleDateString()}`);
        });

        console.log('\n' + '='.repeat(100));
        console.log('\n📝 SUMMARY:');
        console.log(`   Total Agencies: ${agencies.length}`);
        console.log('\n' + '='.repeat(100));

        // Group by state
        const byState = {};
        agencies.forEach(agency => {
            const state = agency.districts?.states?.name || 'Unknown';
            if (!byState[state]) byState[state] = [];
            byState[state].push(agency);
        });

        console.log('\n📊 AGENCIES BY STATE:\n');
        Object.keys(byState).sort().forEach(state => {
            console.log(`   ${state}: ${byState[state].length} agencies`);
        });

        console.log('\n' + '='.repeat(100));
        console.log('\n💡 DEFAULT PASSWORD FOR ALL AGENCIES: PMajay@2024#Demo');
        console.log('💡 Users can change their password after first login');
        console.log('\n' + '='.repeat(100));

        // Export to CSV format
        console.log('\n\n📄 CSV FORMAT (for Excel/Sheets):\n');
        console.log('Agency Name,Email,Password,District,State,ID');
        agencies.forEach(agency => {
            const stateName = agency.districts?.states?.name || 'N/A';
            const districtName = agency.districts?.name || 'N/A';
            console.log(`"${agency.agency_name}","${agency.email}","PMajay@2024#Demo","${districtName}","${stateName}","${agency.id}"`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the script
getImplementingAgencyLogins();
