-- Test RLS policies from the authenticated user's perspective
-- Run this in Supabase SQL Editor while logged in as the platform admin user

-- 1. Check current user
SELECT 
  '=== CURRENT USER ===' as section,
  auth.uid() as my_auth_uid,
  auth.email() as my_email;

-- 2. Check if I have a profile
SELECT 
  '=== MY PROFILE ===' as section,
  user_id,
  user_platform_id,
  email,
  first_name,
  last_name
FROM public.profiles
WHERE user_id = auth.uid();

-- 3. Check my role assignments
SELECT 
  '=== MY ROLE ASSIGNMENTS ===' as section,
  ura.user_platform_id,
  ura.platform_role_id,
  pr.role_name,
  pr.display_name,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.user_id = auth.uid();

-- 4. Test the EXISTS condition that the policy uses
SELECT 
  '=== POLICY EXISTS TEST ===' as section,
  EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
    JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
    WHERE p.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
  ) as policy_condition_passes;

-- 5. Try to select pets with RLS enabled (this is what the app does)
SELECT 
  '=== PETS I CAN SEE (WITH RLS) ===' as section,
  COUNT(*) as pet_count
FROM public.pets;

-- 6. Try to select EMR records with RLS enabled
SELECT 
  '=== EMR RECORDS I CAN SEE (WITH RLS) ===' as section,
  COUNT(*) as emr_master_count
FROM public.emr_records_master;

-- 7. Try to select IoT EMR records with RLS enabled
SELECT 
  '=== IOT EMR RECORDS I CAN SEE (WITH RLS) ===' as section,
  COUNT(*) as emr_iot_count
FROM public.emr_records_iot;

-- 8. Check which policies are active on pets table
SELECT 
  '=== ACTIVE POLICIES ON PETS TABLE ===' as section,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'pets'
ORDER BY policyname;

-- 9. Check which policies are active on emr_records_master table
SELECT 
  '=== ACTIVE POLICIES ON EMR_RECORDS_MASTER TABLE ===' as section,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'emr_records_master'
ORDER BY policyname;

-- 10. Check which policies are active on emr_records_iot table
SELECT 
  '=== ACTIVE POLICIES ON EMR_RECORDS_IOT TABLE ===' as section,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'emr_records_iot'
ORDER BY policyname;
