-- Cleanup Junk Projects for NGO-Karnataka14
-- Keeps only the 3 known valid projects and deletes the rest for this agency.

-- 1. View what will be deleted (Run this first to check)
SELECT id, title, status, implementing_agency_id
FROM work_orders
WHERE implementing_agency_id = '16078b1c-bcd2-4eaa-81da-8dbd8590166b'
AND title NOT ILIKE 'hostel building'
AND title NOT ILIKE 'hall construction'
AND title NOT ILIKE 'road construction';

-- 2. Delete the junk projects (Uncomment the DELETE lines below to execute)
/*
DELETE FROM work_orders
WHERE implementing_agency_id = '16078b1c-bcd2-4eaa-81da-8dbd8590166b'
AND title NOT ILIKE 'hostel building'
AND title NOT ILIKE 'hall construction'
AND title NOT ILIKE 'road construction';
*/

-- 3. Verify what remains
SELECT id, title, status 
FROM work_orders
WHERE implementing_agency_id = '16078b1c-bcd2-4eaa-81da-8dbd8590166b';
