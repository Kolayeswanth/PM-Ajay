-- Debug TEC - Karnataka
-- IDs found from previous screenshot:
-- 1. 26d31b6c-771f-4a9b-970b-da3103b83615
-- 2. 92c5da66-2f88-4b67-aa4d-d56e5edc125b

-- 1. Check which one has projects
SELECT 
    ia.id as agency_id,
    ia.agency_name,
    ia.email,
    COUNT(wo.id) as project_count
FROM implementing_agencies ia
LEFT JOIN work_orders wo ON ia.id = wo.implementing_agency_id
WHERE ia.id IN ('26d31b6c-771f-4a9b-970b-da3103b83615', '92c5da66-2f88-4b67-aa4d-d56e5edc125b')
GROUP BY ia.id, ia.agency_name, ia.email;

-- 2. Check if there is a user email match
SELECT id, agency_name, email 
FROM implementing_agencies 
WHERE email ILIKE '%tec%';
