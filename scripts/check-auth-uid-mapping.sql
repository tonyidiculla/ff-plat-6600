-- Check the mapping between auth.uid() and user_platform_id
-- This is CRITICAL because RLS policies might be using auth.uid() 
-- but our user_to_role_assignment uses user_platform_id

SELECT 
  '=== AUTH UID TO PLATFORM ID MAPPING ===' as section,
  p.id as auth_uuid,
  p.user_platform_id,
  p.email,
  p.first_name,
  p.last_name
FROM public.profiles p
WHERE p.user_platform_id = 'H00000001'
   OR p.email = 'tony@fusionduotech.com';

-- Check if auth.users has the same UUID
SELECT 
  '=== AUTH.USERS TABLE ===' as section,
  id as auth_uuid,
  email
FROM auth.users
WHERE email = 'tony@fusionduotech.com';

-- Now check what the RLS policies are actually checking
-- The policies might be using auth.uid() but we need user_platform_id
SELECT 
  '=== CRITICAL: CHECK POLICY LOGIC ===' as section,
  policyname,
  qual as policy_expression
FROM pg_policies
WHERE tablename IN ('pets', 'emr_records_master', 'emr_records_iot')
  AND schemaname = 'public'
  AND policyname LIKE '%platform_admin%'
ORDER BY tablename, policyname;
