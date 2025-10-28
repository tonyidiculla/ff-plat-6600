-- Check ALL policies on pets, emr_records_master, emr_records_iot
-- This will show us if there are restrictive policies blocking before platform admin policies

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive, -- PERMISSIVE means OR logic, RESTRICTIVE means AND logic (blocks if false)
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual 
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pets', 'emr_records_master', 'emr_records_iot')
ORDER BY tablename, cmd, policyname;
