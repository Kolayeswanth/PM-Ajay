const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SAMPLE_TITLES = [
    'Road Construction Phase 1',
    'Community Hall Construction',
    'Water Supply Pipeline',
    'School Building Renovation',
    'Solar Street Lights Installation',
    'Drainage System Upgrade',
    'Health Center Construction',
    'Public Park Development',
    'Anganwadi Center Repair',
    'Market Complex Construction'
];

async function removeSampleProjects() {
    console.log('🗑️  Starting removal of sample projects...');

    try {
        // Delete work orders with titles in the sample list
        const { data, error, count } = await supabase
            .from('work_orders')
            .delete({ count: 'exact' })
            .in('title', SAMPLE_TITLES);

        if (error) throw error;

        console.log(`✅ Successfully removed ${count} sample projects.`);

    } catch (error) {
        console.error('Error removing projects:', error);
    }
}

removeSampleProjects();
