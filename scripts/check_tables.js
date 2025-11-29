import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZmVhdWJ2emplcG1taHhnZHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjY1MDEsImV4cCI6MjA3OTc0MjUwMX0.uelA90LXrAcLazZi_LkdisGqft-dtvj0wgOQweMEUGE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTable(tableName) {
    console.log(`Checking table: ${tableName}...`);
    const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });

    if (error) {
        console.error(`❌ Error accessing ${tableName}:`, error.message);
        if (error.code === '42P01') {
            console.error(`   -> Table '${tableName}' does not exist! You need to run the SQL script.`);
        }
    } else {
        console.log(`✅ Table '${tableName}' exists and is accessible.`);
    }
}

async function main() {
    console.log('Verifying Supabase Tables...');
    await checkTable('implementing_agencies');
    await checkTable('executing_agencies');
    await checkTable('dprs');
    await checkTable('reports');
}

main();
