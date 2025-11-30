-- ============================================
-- CLEANUP SCRIPT FOR PM-AJAY DATABASE
-- ============================================
-- This script will delete all data from the main tables
-- Use with caution! This will remove ALL records.
-- ============================================

-- 1. Delete all fund releases to districts
DELETE FROM district_fund_releases;

-- 2. Delete all fund releases to states
DELETE FROM state_fund_releases;

-- 3. Delete all fund allocations
DELETE FROM fund_allocations;

-- 4. Delete all utilization certificates
DELETE FROM utilization_certificates;

-- 5. Delete all proposals
DELETE FROM proposals;

-- 6. Delete all district admin assignments
DELETE FROM district_assignment;

-- 7. Delete all state admin assignments
DELETE FROM state_assignment;

-- 8. Delete all projects (if table exists)
DELETE FROM projects;

-- 9. Delete all support tickets (if table exists)
DELETE FROM support_tickets;

-- 10. Delete all reports (if table exists)
DELETE FROM reports;

-- ============================================
-- NOTE: This script does NOT delete:
-- - States table (master data)
-- - Districts table (master data)
-- - Users/Auth data
-- ============================================

-- To verify deletion, run these queries:
-- SELECT COUNT(*) FROM district_fund_releases;
-- SELECT COUNT(*) FROM state_fund_releases;
-- SELECT COUNT(*) FROM fund_allocations;
-- SELECT COUNT(*) FROM district_assignment;
-- SELECT COUNT(*) FROM state_assignment;
