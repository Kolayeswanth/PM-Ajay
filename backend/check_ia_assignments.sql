-- Check Implementing Agency Data and Assignments

-- 1. List all Implementing Agencies and their User IDs
SELECT 
    id, 
    agency_name, 
    email, 
    user_id 
FROM implementing_agencies;

-- 2. Check Work Orders assigned to each agency
SELECT 
    ia.agency_name,
    wo.id as work_order_id,
    wo.title,
    wo.status,
    wo.progress,
    wo.funds_released,
    wo.funds_used
FROM work_orders wo
JOIN implementing_agencies ia ON wo.implementing_agency_id = ia.id
ORDER BY ia.agency_name, wo.id;

-- 3. Check if there are any unlinked IA users (in auth.users but not in implementing_agencies)
-- Note: We can't query auth.users directly easily from here without permissions, 
-- but we can check if the emails in implementing_agencies match what we expect.
