import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Manually load env vars since dotenv is not installed
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                const val = values.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = val;
            }
        }
    });
    console.log('✅ Loaded .env file manually');
} catch (e) {
    console.error('⚠️ Could not load .env file:', e.message);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL; // Try VITE_ prefix too as it is a Vite project
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY vars');
    console.error('Available Environment Variables:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAgencies() {
    console.log('🌱 Seeding Implementing Agencies...');

    try {
        // DELETE ALL EXISTING
        console.log('🗑️ Deleting all existing implementing agencies...');
        
        const { data: allRows, error: fetchError } = await supabase.from('implementing_agencies').select('id');
        
        if (fetchError) {
             console.error('❌ Error fetching agencies to delete:', fetchError.message);
        } else if (allRows && allRows.length > 0) {
            const ids = allRows.map(r => r.id);
            const { error: deleteError } = await supabase.from('implementing_agencies').delete().in('id', ids);
            if (deleteError) {
                console.error('❌ Error deleting agencies:', deleteError.message);
            } else {
                console.log(`✅ Deleted ${ids.length} agencies.`);
            }
        } else {
            console.log('✅ No existing agencies to delete.');
        }

        // Helper to fetch state ID
        const getStateId = async (name) => {
            const { data } = await supabase.from('states').select('id').eq('name', name).single();
            return data ? data.id : null;
        };

        const apId = await getStateId('Andhra Pradesh');
        const mhId = await getStateId('Maharashtra');
        const kaId = await getStateId('Karnataka');

        console.log(`State IDs - AP: ${apId}, MH: ${mhId}, KA: ${kaId}`);

        // INSERT ANDHRA PRADESH AGENCIES (For all found districts)
        if (apId) {
            const { data: districts } = await supabase.from('districts').select('id, name').eq('state_id', apId);
            if (districts && districts.length > 0) {
                console.log(`📍 Found ${districts.length} districts for Andhra Pradesh. Creating agencies...`);
                const agencies = districts.map((d, index) => ({
                    agency_name: `AP Implementing Agency - ${d.name}`,
                    email: `ia.ap.${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pmajay.gov.in`,
                    contact_number: `98765432${index.toString().padStart(2, '0')}`,
                    address: `Collectorate Complex, ${d.name}, AP`,
                    registration_no: `AP-${d.name.substring(0, 3).toUpperCase()}-${2024 + index}`,
                    agency_type: 'Government',
                    state_id: apId,
                    district_id: d.id,
                    state_name: 'Andhra Pradesh',
                    district_name: d.name
                }));
                await insertBatch(agencies);
            } else {
                console.log('⚠️ No districts found for Andhra Pradesh.');
            }
        }

        // INSERT MAHARASHTRA AGENCIES (Limit 3)
        if (mhId) {
             const { data: districts } = await supabase.from('districts').select('id, name').eq('state_id', mhId).limit(3);
             if (districts && districts.length > 0) {
                console.log(`📍 Creating agencies for Maharashtra (${districts.length})...`);
                const agencies = districts.map((d, index) => ({
                    agency_name: `Maha Tribal Works - ${d.name}`,
                    email: `ia.mh.${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pmajay.gov.in`,
                     contact_number: `91234567${index.toString().padStart(2, '0')}`,
                    address: `Tribal Welfare Office, ${d.name}, MH`,
                    registration_no: `MH-${d.name.substring(0, 3).toUpperCase()}-${2024 + index}`,
                    agency_type: 'NGO',
                    state_id: mhId,
                    district_id: d.id,
                    state_name: 'Maharashtra',
                    district_name: d.name
                }));
                await insertBatch(agencies);
             }
        }

         // INSERT KARNATAKA AGENCIES (Limit 2)
        if (kaId) {
             const { data: districts } = await supabase.from('districts').select('id, name').eq('state_id', kaId).limit(2);
             if (districts && districts.length > 0) {
                console.log(`📍 Creating agencies for Karnataka (${districts.length})...`);
                const agencies = districts.map((d, index) => ({
                    agency_name: `Karnataka SC/ST Welfare - ${d.name}`,
                    email: `ia.ka.${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@pmajay.gov.in`,
                    contact_number: `99887766${index.toString().padStart(2, '0')}`,
                    address: `Social Welfare Dept, ${d.name}, KA`,
                    registration_no: `KA-${d.name.substring(0, 3).toUpperCase()}-${2024 + index}`,
                    agency_type: 'Government',
                    state_id: kaId,
                    district_id: d.id,
                    state_name: 'Karnataka',
                    district_name: d.name
                }));
                await insertBatch(agencies);
             }
        }

        console.log('✨ All operations completed.');

    } catch (e) {
        console.error('❌ Script failed:', e);
    }
}

async function insertBatch(rows) {
    if (!rows.length) return;
    const { error } = await supabase.from('implementing_agencies').insert(rows);
    if (error) console.error('❌ Error inserting batch:', error.message);
    else console.log(`✅ Inserted ${rows.length} records.`);
}

seedAgencies();
