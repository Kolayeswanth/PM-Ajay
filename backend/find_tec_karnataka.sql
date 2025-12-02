-- Find details for TEC - Karnataka
SELECT id, agency_name, email, user_id 
FROM implementing_agencies 
WHERE agency_name ILIKE '%TEC%Karnataka%' OR email ILIKE '%tec%';
