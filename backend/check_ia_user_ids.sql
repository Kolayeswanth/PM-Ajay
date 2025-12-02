-- Check if user_id is populated for Implementing Agencies
SELECT 
    id, 
    agency_name, 
    email, 
    user_id 
FROM implementing_agencies
WHERE agency_name ILIKE '%Karnataka%';

-- Also check for the specific TEC emails to see what we are dealing with
SELECT * FROM implementing_agencies WHERE agency_name ILIKE '%TEC%';
