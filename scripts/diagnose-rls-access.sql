-- Diagnostic script to check RLS policies and data access
-- Run this to understand why Platform Admin sees 0 records

-- 1. Check user's role assignment
SELECT 
  '=== USER ROLE ASSIGNMENT ===' as section,
  ura.user_platform_id,
  ura.platform_role_id,
  pr.name as role_name,
  pr.description,
  ura.is_active as assignment_active
FROM user_to_role_assignment ura
JOIN platform_roles pr ON ura.platform_role_id = pr.platform_role_id
WHERE ura.user_platform_id = 'H00000001'
  AND ura.is_active = true;

-- 2. Check RLS status on tables
SELECT 
  '=== RLS STATUS ===' as section,
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('pets', 'emr_records_master', 'emr_records_iot')
  AND schemaname = 'public';

-- 3. List all RLS policies on pets table
SELECT 
  '=== PETS TABLE POLICIES ===' as section,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'pets' 
  AND schemaname = 'public'
  AND policyname LIKE '%platform_admin%';

-- 4. List all RLS policies on emr_records_master table
SELECT 
  '=== EMR_RECORDS_MASTER TABLE POLICIES ===' as section,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'emr_records_master' 
  AND schemaname = 'public'
  AND policyname LIKE '%platform_admin%';

-- 5. List all RLS policies on emr_records_iot table
SELECT 
  '=== EMR_RECORDS_IOT TABLE POLICIES ===' as section,
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'emr_records_iot' 
  AND schemaname = 'public'
  AND policyname LIKE '%platform_admin%';

-- 6. Check actual data counts (as service role)
SELECT 
  '=== DATA COUNTS (SERVICE ROLE) ===' as section,
  (SELECT count(*) FROM public.pets) as total_pets,
  (SELECT count(*) FROM public.emr_records_master) as total_emr_master,
  (SELECT count(*) FROM public.emr_records_iot) as total_emr_iot;

-- 7. Test if the RLS policy expression would match for our user
-- This simulates what the policy checks
SELECT 
  '=== POLICY MATCH TEST ===' as section,
  EXISTS (
    SELECT 1
    FROM user_to_role_assignment ura
    JOIN platform_roles pr ON ura.platform_role_id = pr.platform_role_id
    WHERE ura.user_platform_id = 'H00000001'
      AND pr.name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
  ) as user_has_platform_admin_role;

-- 8. Check pets table data with owner info
SELECT 
  '=== PETS TABLE DATA ===' as section,
  pet_platform_id,
  name,
  user_platform_id as owner_id,
  is_active
FROM public.pets;

-- 9. Check EMR records master data
SELECT 
  '=== EMR_RECORDS_MASTER DATA ===' as section,
  emr_platform_id,
  pet_platform_id,
  user_platform_id,
  visit_type,
  status,
  is_active
FROM public.emr_records_master;

-- 10. Check EMR records IoT data
SELECT 
  '=== EMR_RECORDS_IOT DATA ===' as section,
  emr_platform_id,
  pet_platform_id,
  user_platform_id,
  device_type,
  is_active
FROM public.emr_records_iot;
