-- Find where the Karnataka projects are assigned

SELECT 
    wo.id as work_order_id,
    wo.title,
    wo.implementing_agency_id,
    ia.agency_name,
    ia.email
FROM work_orders wo
JOIN implementing_agencies ia ON wo.implementing_agency_id = ia.id
WHERE ia.agency_name ILIKE '%Karnataka%'
ORDER BY ia.agency_name;
