const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTimeFilter() {
    console.log('--- Testing Time-Based Reminder Filter ---\n');

    const { data: proposals } = await supabase
        .from('district_proposals')
        .select('id, project_name, status, created_at')
        .eq('status', 'SUBMITTED')
        .order('created_at', { ascending: false });

    console.log(`Found ${proposals.length} SUBMITTED proposals:\n`);

    proposals.forEach(p => {
        const createdAt = new Date(p.created_at);
        const now = new Date();
        const minutesPending = (now - createdAt) / (1000 * 60);
        const hoursPending = minutesPending / 60;
        const daysPending = hoursPending / 24;

        let timeStr;
        if (daysPending >= 1) {
            timeStr = `${daysPending.toFixed(1)} days`;
        } else if (hoursPending >= 1) {
            timeStr = `${hoursPending.toFixed(1)} hours`;
        } else {
            timeStr = `${minutesPending.toFixed(1)} minutes`;
        }

        const willSendReminder = minutesPending >= 1 ? '✅ WILL SEND' : '⏳ TOO RECENT';

        console.log(`[${p.id}] ${p.project_name}`);
        console.log(`    Created: ${createdAt.toLocaleString()}`);
        console.log(`    Pending: ${timeStr}`);
        console.log(`    Status: ${willSendReminder}\n`);
    });
}

testTimeFilter();
