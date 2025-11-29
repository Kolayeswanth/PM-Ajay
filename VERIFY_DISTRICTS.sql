-- VERIFICATION QUERIES FOR DISTRICTS

-- 1. Count districts by state
SELECT state_code, COUNT(*) as district_count
FROM districts
WHERE state_code IN ('DL', 'AP', 'AN', 'AS', 'MH', 'KA', 'KL', 'GJ', 'TN')
GROUP BY state_code
ORDER BY state_code;

-- 2. View all Tamil Nadu districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'TN'
ORDER BY name;

-- 3. View all Delhi districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'DL'
ORDER BY name;

-- 4. View all Andhra Pradesh districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'AP'
ORDER BY name;

-- 5. View all Maharashtra districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'MH'
ORDER BY name;

-- 6. View all Karnataka districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'KA'
ORDER BY name;

-- 7. View all Kerala districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'KL'
ORDER BY name;

-- 8. View all Gujarat districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'GJ'
ORDER BY name;

-- 9. View all Assam districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'AS'
ORDER BY name;

-- 10. View all Andaman districts
SELECT id, name, state_code
FROM districts
WHERE state_code = 'AN'
ORDER BY name;

-- 11. Check if any districts are missing state_code
SELECT COUNT(*) as districts_without_state_code
FROM districts
WHERE state_code IS NULL;

-- 12. View ALL districts (grouped by state)
SELECT state_code, name
FROM districts
WHERE state_code IS NOT NULL
ORDER BY state_code, name;

-- 13. Expected counts (for verification)
-- DL: 11, AP: 26, AN: 3, AS: 35, MH: 36, KA: 31, KL: 14, GJ: 33, TN: 38
-- Total expected: 227 districts
