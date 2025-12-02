-- Check districts and states schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'districts';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'states';
