-- Deep dive: Check the exact relationship between profiles and user_to_role_assignment

-- 1. What's in profiles for this user?
SELECT 
  'PROFILES TABLE' as source,
  user_id,
  user_platform_id,
  email
FROM public.profiles
WHERE email = 'tony@fusionduotech.com';

-- 2. What's in user_to_role_assignment for this user_platform_id?
SELECT 
  'USER_TO_ROLE_ASSIGNMENT TABLE' as source,
  user_id,
  user_platform_id,
  platform_role_id
FROM public.user_to_role_assignment
WHERE user_platform_id = 'H00000001';

-- 3. Check if the user_id matches between the two tables
SELECT 
  'CHECKING USER_ID MATCH' as check_type,
  p.user_id as profiles_user_id,
  ura.user_id as ura_user_id,
  CASE 
    WHEN p.user_id = ura.user_id THEN 'MATCH ✅'
    WHEN p.user_id IS NULL THEN 'profiles.user_id is NULL ❌'
    WHEN ura.user_id IS NULL THEN 'ura.user_id is NULL ❌'
    ELSE 'MISMATCH ❌'
  END as match_status
FROM public.profiles p
FULL OUTER JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
WHERE p.user_platform_id = 'H00000001' OR ura.user_platform_id = 'H00000001';

-- 4. Try the join step by step
-- Step 1: Join profiles to user_to_role_assignment
SELECT 
  'STEP 1: profiles → user_to_role_assignment' as step,
  p.user_id as profiles_user_id,
  p.user_platform_id,
  p.email,
  ura.user_id as ura_user_id,
  ura.platform_role_id,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
WHERE p.email = 'tony@fusionduotech.com';

-- Step 2: Add the platform_roles join
SELECT 
  'STEP 2: + platform_roles' as step,
  p.user_id,
  p.user_platform_id,
  p.email,
  pr.role_name,
  pr.display_name,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.email = 'tony@fusionduotech.com';

-- Step 3: Add the role name filter
SELECT 
  'STEP 3: + role name filter' as step,
  p.user_id,
  p.email,
  pr.role_name,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.email = 'tony@fusionduotech.com'
  AND pr.role_name IN ('platform_admin', 'super_admin');

-- Step 4: Add the is_active filter
SELECT 
  'STEP 4: + is_active filter' as step,
  p.user_id,
  p.email,
  pr.role_name,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.email = 'tony@fusionduotech.com'
  AND pr.role_name IN ('platform_admin', 'super_admin')
  AND ura.is_active = true;
