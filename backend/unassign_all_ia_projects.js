const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'NOT FOUND');
console.log('Service Role Key:', supabaseKey ? 'Found' : 'NOT FOUND');

const supabase = createClient(supabaseUrl, supabaseKey);

async function unassignAllProjects() {
    try {
        console.log('🔄 Unassigning all projects from Implementing Agencies...\n');

        // Check current assignments
        const { data: currentAssignments, error: checkError } = await supabase
            .from('district_proposals')
            .select('id, project_name, implementing_agency_id, status')
            .not('implementing_agency_id', 'is', null);

        if (checkError) {
            console.error('❌ Error checking assignments:', checkError);
            return;
        }

        console.log(`📊 Found ${currentAssignments?.length || 0} projects currently assigned to IAs\n`);

        if (currentAssignments && currentAssignments.length > 0) {
            console.log('Current assignments:');
            currentAssignments.forEach(p => {
                console.log(`  - Project ${p.id}: ${p.project_name} (Status: ${p.status})`);
            });
            console.log('');
        }

        // Unassign all projects
        const { data: updated, error: updateError } = await supabase
            .from('district_proposals')
            .update({
                implementing_agency_id: null,
                status: 'SUBMITTED'
            })
            .not('implementing_agency_id', 'is', null)
            .select();

        if (updateError) {
            console.error('❌ Error unassigning projects:', updateError);
            return;
        }

        console.log(`✅ Successfully unassigned ${updated?.length || 0} projects\n`);

        // Verify
        const { data: remaining, error: verifyError } = await supabase
            .from('district_proposals')
            .select('id')
            .not('implementing_agency_id', 'is', null);

        if (verifyError) {
            console.error('❌ Error verifying:', verifyError);
            return;
        }

        console.log(`📊 Remaining assignments: ${remaining?.length || 0}`);
        
        if (remaining && remaining.length === 0) {
            console.log('✅ All projects successfully unassigned!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

unassignAllProjects();
