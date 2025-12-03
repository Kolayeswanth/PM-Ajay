const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMismatch() {
    const stateName = 'Karnataka';
    console.log(`Checking district mismatch for state: ${stateName}`);

    // 1. Get State ID
    const { data: states } = await supabase
        .from('states')
        .select('id')
        .eq('name', stateName)
        .single();

    if (!states) {
        console.error('State not found');
        return;
    }

    // 2. Get Districts from 'districts' table (Dropdown source)
    const { data: dropdownDistricts } = await supabase
        .from('districts')
        .select('name')
        .eq('state_id', states.id)
        .order('name');

    const dropdownNames = dropdownDistricts.map(d => d.name);
    console.log(`\nDropdown Districts (${dropdownNames.length}):`);
    console.log(dropdownNames.join(', '));

    // 3. Get Districts from 'implementing_agencies' table (Project source)
    const { data: agencyDistricts } = await supabase
        .from('implementing_agencies')
        .select('district_name')
        .ilike('state_name', stateName);

    const projectNames = [...new Set(agencyDistricts.map(d => d.district_name).filter(Boolean))].sort();
    console.log(`\nProject/Agency Districts (${projectNames.length}):`);
    console.log(projectNames.join(', '));

    // 4. Compare
    console.log('\n--- Comparison ---');
    const missingInDropdown = projectNames.filter(p => !dropdownNames.includes(p));
    const missingInProjects = dropdownNames.filter(d => !projectNames.includes(d));

    if (missingInDropdown.length > 0) {
        console.log('⚠️  Districts in Projects but NOT in Dropdown (User cannot filter these):');
        console.log(missingInDropdown);
    } else {
        console.log('✅ All project districts are present in the dropdown.');
    }

    // Check for near matches (case/whitespace)
    console.log('\nChecking for case/whitespace mismatches:');
    projectNames.forEach(p => {
        const exactMatch = dropdownNames.find(d => d === p);
        if (!exactMatch) {
            const looseMatch = dropdownNames.find(d => d.trim().toLowerCase() === p.trim().toLowerCase());
            if (looseMatch) {
                console.log(`Mismatch found: Project has '${p}', Dropdown has '${looseMatch}'`);
            } else {
                console.log(`No match found for project district: '${p}'`);
            }
        }
    });
}

checkMismatch();
