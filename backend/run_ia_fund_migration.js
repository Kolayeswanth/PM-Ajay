const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'NOT FOUND');
console.log('Service Role Key:', supabaseKey ? 'Found' : 'NOT FOUND');

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        console.log('Reading migration file...');
        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_ia_fund_releases.sql'),
            'utf8'
        );

        console.log('Executing migration...');
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            console.error('Migration failed:', error);
            
            // Try direct approach via REST API
            console.log('\nTrying alternative method...');
            const statements = sql.split(';').filter(s => s.trim());
            
            for (const statement of statements) {
                if (!statement.trim()) continue;
                
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ sql_query: statement.trim() })
                });
                
                if (!response.ok) {
                    const error = await response.text();
                    console.error('Statement failed:', error);
                }
            }
        } else {
            console.log('✅ Migration completed successfully!');
        }
        
        // Verify table was created
        const { data: tables, error: checkError } = await supabase
            .from('ia_fund_releases')
            .select('*')
            .limit(1);
            
        if (checkError && checkError.code === '42P01') {
            console.log('❌ Table was not created. Manual migration needed.');
            console.log('\nPlease run this SQL in Supabase SQL Editor:');
            console.log(sql);
        } else if (checkError) {
            console.log('⚠️ Could not verify table:', checkError.message);
        } else {
            console.log('✅ Table ia_fund_releases verified!');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

runMigration();
