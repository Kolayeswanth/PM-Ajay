-- Check columns in implementing_agencies table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'implementing_agencies';
