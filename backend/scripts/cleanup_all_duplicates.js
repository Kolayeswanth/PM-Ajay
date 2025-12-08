const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
if (!process.env.SUPABASE_URL) require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupDistrictDuplicates() {
    console.log('=== Cleaning up District Admin Duplicates ===\n');

    const { data: admins, error } = await supabase
        .from('district_assignment')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching district admins:', error);
        return;
    }

    console.log(`Total district admin records: ${admins.length}`);

    const districtMap = {};

    admins.forEach(admin => {
        const normalizedDistrict = admin.district_name.trim().toLowerCase();
        if (!districtMap[normalizedDistrict]) {
            districtMap[normalizedDistrict] = [];
        }
        districtMap[normalizedDistrict].push(admin);
    });

    let duplicatesFound = false;
    for (const [districtKey, adminList] of Object.entries(districtMap)) {
        if (adminList.length > 1) {
            duplicatesFound = true;
            console.log(`\nFound ${adminList.length} duplicates for district: "${districtKey}"`);

            adminList.sort((a, b) => b.id - a.id);

            const toKeep = adminList[0];
            const toDelete = adminList.slice(1);

            console.log(`✅ Keeping latest: ID ${toKeep.id} (${toKeep.admin_name} - ${toKeep.district_name})`);

            for (const admin of toDelete) {
                console.log(`❌ Deleting duplicate: ID ${admin.id} (${admin.admin_name} - ${admin.district_name})`);

                const { error: deleteError } = await supabase
                    .from('district_assignment')
                    .delete()
                    .eq('id', admin.id);

                if (deleteError) {
                    console.error(`   Failed to delete ID ${admin.id}: ${deleteError.message}`);
                } else {
                    console.log(`   Successfully deleted ID ${admin.id}`);
                }
            }
        }
    }

    if (!duplicatesFound) {
        console.log('\n✅ No duplicates found in district_assignment table.');
    } else {
        console.log('\n✅ District admin cleanup completed.');
    }
}

async function cleanupImplementingAgencyDuplicates() {
    console.log('\n\n=== Cleaning up Implementing Agency Duplicates ===\n');

    const { data: agencies, error } = await supabase
        .from('implementing_agencies_assignment')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching implementing agencies:', error);
        return;
    }

    console.log(`Total implementing agency records: ${agencies.length}`);

    const agencyMap = {};

    agencies.forEach(agency => {
        const key = `${agency.district_name.trim().toLowerCase()}|${agency.agency_name.trim().toLowerCase()}`;
        if (!agencyMap[key]) {
            agencyMap[key] = [];
        }
        agencyMap[key].push(agency);
    });

    let duplicatesFound = false;
    for (const [key, agencyList] of Object.entries(agencyMap)) {
        if (agencyList.length > 1) {
            duplicatesFound = true;
            const [district, agency] = key.split('|');
            console.log(`\nFound ${agencyList.length} duplicates for: "${district}" - "${agency}"`);

            agencyList.sort((a, b) => b.id - a.id);

            const toKeep = agencyList[0];
            const toDelete = agencyList.slice(1);

            console.log(`✅ Keeping latest: ID ${toKeep.id} (${toKeep.admin_name} - ${toKeep.agency_name})`);

            for (const ag of toDelete) {
                console.log(`❌ Deleting duplicate: ID ${ag.id} (${ag.admin_name} - ${ag.agency_name})`);

                const { error: deleteError } = await supabase
                    .from('implementing_agencies_assignment')
                    .delete()
                    .eq('id', ag.id);

                if (deleteError) {
                    console.error(`   Failed to delete ID ${ag.id}: ${deleteError.message}`);
                } else {
                    console.log(`   Successfully deleted ID ${ag.id}`);
                }
            }
        }
    }

    if (!duplicatesFound) {
        console.log('\n✅ No duplicates found in implementing_agencies_assignment table.');
    } else {
        console.log('\n✅ Implementing agency cleanup completed.');
    }
}

async function main() {
    await cleanupDistrictDuplicates();
    await cleanupImplementingAgencyDuplicates();
    console.log('\n\n=== All cleanup operations completed ===');
}

main();
