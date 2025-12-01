import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

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
