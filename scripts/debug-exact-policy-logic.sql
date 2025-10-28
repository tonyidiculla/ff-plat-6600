-- Test if user H00000001 (tony@fusionduotech.com) passes the platform admin check
-- This tests the EXACT logic used in the RLS policies

-- Step 1: Get user's auth UUID from their email
SELECT 
  '=== Step 1: Find Auth UUID ===' as step,
  user_id as auth_uuid,
  user_platform_id,
  email
FROM public.profiles
WHERE email = 'tony@fusionduotech.com';

-- Step 2: Check role assignment using the EXACT logic from the policy
SELECT 
  '=== Step 2: Test Policy Logic ===' as step,
  p.user_id as auth_uuid,
  p.user_platform_id,
  p.email,
  ura.platform_role_id,
  pr.role_name,
  pr.display_name,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.email = 'tony@fusionduotech.com'
  AND pr.role_name IN ('platform_admin', 'super_admin')
  AND ura.is_active = true;

-- Step 3: Check if the EXISTS would return TRUE
SELECT 
  '=== Step 3: EXISTS Test ===' as step,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM public.profiles p2
      JOIN public.user_to_role_assignment ura2 ON p2.user_platform_id = ura2.user_platform_id
      JOIN public.platform_roles pr2 ON pr2.id = ura2.platform_role_id
      WHERE p2.email = 'tony@fusionduotech.com'
        AND pr2.role_name IN ('platform_admin', 'super_admin')
        AND ura2.is_active = true
    ) THEN 'TRUE - Policy should allow access'
    ELSE 'FALSE - Policy will block access'
  END as result;

-- Step 4: Check what role_name values actually exist
SELECT 
  '=== Step 4: All Role Names in Platform Roles ===' as step,
  id,
  role_name,
  display_name
FROM public.platform_roles
ORDER BY role_name;

-- Step 5: Check what the user_to_role_assignment actually contains
SELECT 
  '=== Step 5: User Role Assignment for H00000001 ===' as step,
  user_id,
  user_platform_id,
  platform_role_id,
  is_active
FROM public.user_to_role_assignment
WHERE user_platform_id = 'H00000001';
