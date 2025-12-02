-- Check Implementing Agencies and their State IDs
SELECT 
    id, 
    agency_name, 
    state_id, 
    district_id,
    agency_type
FROM implementing_agencies
ORDER BY state_id;

-- Also check what the state_ids actually correspond to (if there is a states table, though I don't have access to it easily, I can infer from names)
-- Let's just see if they are different.
