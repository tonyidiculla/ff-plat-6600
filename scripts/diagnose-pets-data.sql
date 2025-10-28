-- ============================================================
-- DIAGNOSTIC QUERIES - Check what data exists
-- ============================================================
-- Run these in Supabase SQL Editor to see what data is in the database

-- 1. Check total pets in database (bypassing RLS)
SELECT COUNT(*) as total_pets_in_db FROM public.pets;

-- 2. Check total EMR records in database (bypassing RLS)
SELECT COUNT(*) as total_emr_in_db FROM public.emr_records_master;

-- 3. Check your user's role assignments
SELECT 
  ura.user_platform_id,
  ura.platform_role_id,
  pr.role_name,
  pr.display_name,
  pr.privilege_level,
  ura.is_active
FROM public.user_to_role_assignment ura
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE ura.user_platform_id = 'H00000001';

-- 4. Check your user's auth.uid
SELECT 
  user_id,
  user_platform_id,
  email,
  first_name,
  last_name
FROM public.profiles
WHERE user_platform_id = 'H00000001';

-- 5. Check if platform_admin role exists
SELECT id, role_name, display_name, privilege_level
FROM public.platform_roles
WHERE role_name IN ('platform_admin', 'super_admin');

-- 6. Check current RLS policies on pets table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  SUBSTRING(qual, 1, 100) as policy_condition
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'pets'
ORDER BY policyname;

-- 7. Sample some pets data (first 5 rows)
SELECT 
  pet_platform_id,
  name,
  species,
  breed,
  user_platform_id,
  is_active,
  created_at
FROM public.pets
ORDER BY created_at DESC
LIMIT 5;

-- 8. Sample some EMR data (first 5 rows)
SELECT 
  emr_platform_id,
  pet_platform_id,
  user_platform_id,
  visit_type,
  status,
  is_active,
  created_at
FROM public.emr_records_master
ORDER BY created_at DESC
LIMIT 5;

-- 9. Test RLS for current user (run this while logged in as your user)
-- This will show you what YOU can see with current RLS policies
SELECT 'Testing RLS - if this returns 0, RLS is blocking you' as message;
SELECT COUNT(*) as pets_i_can_see FROM public.pets;
SELECT COUNT(*) as emr_i_can_see FROM public.emr_records_master;
