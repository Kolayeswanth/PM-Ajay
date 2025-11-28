import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://gwfeaubvzjepmmhxgdvc.supabase.co';
// Using the key provided by the user earlier
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const CSV_FILENAME = 'executing_agencies.csv';
const DEFAULT_PASSWORD = 'Test123!';

if (!SERVICE_ROLE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is missing.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const csvPath = path.join(__dirname, '..', CSV_FILENAME);

async function importExecutingAgencies() {
    console.log(`📖 Reading from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
        console.error(`❌ Error: ${CSV_FILENAME} not found. Please place it in the project root.`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);

    if (lines.length < 2) {
        console.error('❌ Error: CSV file is empty.');
        process.exit(1);
    }

    // Parse Headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const getIdx = (partialName) => headers.findIndex(h => h.includes(partialName));

    const nameIdx = getIdx('agency_name');
    const emailIdx = getIdx('email');
    const typeIdx = getIdx('agency_type');
    const regIdx = getIdx('registration_no');
    const addrIdx = getIdx('address');
    const phoneIdx = getIdx('contact_number');
    const stateIdx = getIdx('state_name');
    const distIdx = getIdx('district_name');

    if (nameIdx === -1 || emailIdx === -1) {
        console.error('❌ Error: Missing "agency_name" or "email" columns in CSV.');
        process.exit(1);
    }

    // Helper to parse CSV line
    const parseCSVLine = (text) => {
        const result = [];
        let cell = '';
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(cell);
                cell = '';
            } else {
                cell += char;
            }
        }
        result.push(cell);
        return result.map(c => c.trim().replace(/^"|"$/g, '').replace(/'/g, "''"));
    };

    console.log('🚀 Starting Executing Agency import...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);
        const name = cols[nameIdx];
        const rawEmail = cols[emailIdx];

        if (!name || !rawEmail) continue;

        const email = rawEmail.replace(/\s+/g, ''); // Sanitize email
        const type = typeIdx !== -1 ? cols[typeIdx] : 'Panchayat';
        const reg = regIdx !== -1 ? cols[regIdx] : '';
        const addr = addrIdx !== -1 ? cols[addrIdx] : '';
        const phone = phoneIdx !== -1 ? cols[phoneIdx] : '';
        const state = stateIdx !== -1 ? cols[stateIdx] : '';
        const dist = distIdx !== -1 ? cols[distIdx] : '';

        try {
            // 1. Create User via Admin API
            const { data: userData, error: userError } = await supabase.auth.admin.createUser({
                email: email,
                password: DEFAULT_PASSWORD,
                email_confirm: true,
                user_metadata: { full_name: name }
            });

            let userId = userData?.user?.id;

            if (userError) {
                if (userError.message.includes('already registered')) {
                    const { data: listData } = await supabase.auth.admin.listUsers();
                    const existingUser = listData.users.find(u => u.email === email);
                    if (existingUser) {
                        userId = existingUser.id;
                        // Update password just in case
                        await supabase.auth.admin.updateUserById(userId, { password: DEFAULT_PASSWORD });
                    }
                } else {
                    console.error(`❌ Failed to create user ${email}: ${userError.message}`);
                    errorCount++;
                    continue;
                }
            }

            if (!userId) {
                console.error(`❌ Could not get User ID for ${email}`);
                errorCount++;
                continue;
            }

            // 2. Upsert Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: email,
                    role: 'executing_agency', // Correct role
                    full_name: name
                });

            if (profileError) {
                console.error(`❌ Profile error for ${email}: ${profileError.message}`);
                errorCount++;
                continue;
            }

            // 3. Upsert Agency Details
            const { error: agencyError } = await supabase
                .from('executing_agencies')
                .upsert({
                    user_id: userId,
                    email: email,
                    agency_name: name,
                    agency_type: type,
                    registration_no: reg,
                    address: addr,
                    contact_number: phone,
                    state_name: state,
                    district_name: dist
                }, { onConflict: 'email' });

            if (agencyError) {
                console.error(`❌ Agency error for ${email}: ${agencyError.message}`);
                errorCount++;
                continue;
            }

            console.log(`✅ Imported: ${email}`);
            successCount++;

        } catch (err) {
            console.error(`❌ Unexpected error for ${email}:`, err);
            errorCount++;
        }
    }

    console.log('\n--- Import Summary ---');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
}

importExecutingAgencies();
