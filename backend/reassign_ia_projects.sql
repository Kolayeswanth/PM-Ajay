-- Reassign projects to the correct Implementing Agency

-- Current (Wrong) Agency ID: 2bfc5307-6ce5-4922-82e9-8bdc2ee17b65 (NGO-Karnataka96@pmajay.in)
-- Correct Agency ID: 16078b1c-bcd2-4eaa-81da-8dbd8590166b (ngo-karnataka14@nic.in)

-- 1. Verify the projects before update
SELECT id, title, implementing_agency_id 
FROM work_orders 
WHERE implementing_agency_id = '2bfc5307-6ce5-4922-82e9-8bdc2ee17b65';

-- 2. Update the assignments
UPDATE work_orders
SET implementing_agency_id = '16078b1c-bcd2-4eaa-81da-8dbd8590166b'
WHERE implementing_agency_id = '2bfc5307-6ce5-4922-82e9-8bdc2ee17b65';

-- 3. Verify the projects after update
SELECT id, title, implementing_agency_id 
FROM work_orders 
WHERE implementing_agency_id = '16078b1c-bcd2-4eaa-81da-8dbd8590166b';
