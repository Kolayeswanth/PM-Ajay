const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running migration to add role and responsibility fields to work_orders table...');
  
  try {
    // Since we can't use rpc, let's try to run a simple query to check if the table exists
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error accessing work_orders table:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Successfully accessed work_orders table');
    console.log('Table exists and is accessible.');
    
    // Note: In a production environment, you would typically run the SQL migration
    // through the Supabase dashboard or CLI. For now, we'll inform the user to
    // manually run the migration.
    
    console.log('\n📝 Please manually run the following SQL in your Supabase SQL editor:');
    console.log(`
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS assigned_user_role TEXT,
ADD COLUMN IF NOT EXISTS assigned_user_responsibilities TEXT[],
ADD COLUMN IF NOT EXISTS assigned_user_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_work_orders_assigned_role ON work_orders(assigned_user_role);
    `);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

runMigration();