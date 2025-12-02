-- Debug Missing Projects for ngo-karnataka14@nic.in

-- 1. Check the details of the current logged-in agency
SELECT id, agency_name, email, user_id 
FROM implementing_agencies 
WHERE id = '16078b1c-bcd2-4eaa-81da-8dbd8590166b';

-- 2. List ALL Work Orders and who they are assigned to
SELECT 
    wo.id, 
    wo.title, 
    wo.implementing_agency_id,
    ia.agency_name as assigned_agency_name,
    ia.email as assigned_agency_email
FROM work_orders wo
LEFT JOIN implementing_agencies ia ON wo.implementing_agency_id = ia.id;

-- 3. Check if there are other agencies with similar names
SELECT id, agency_name, email 
FROM implementing_agencies 
WHERE agency_name ILIKE '%Karnataka%' OR email ILIKE '%karnataka%';
