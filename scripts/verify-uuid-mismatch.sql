-- CRITICAL: Check if there's a UUID mismatch between auth.users and profiles

-- 1. What's the user_id in auth.users for tony@fusionduotech.com?
SELECT 
  'AUTH.USERS' as source,
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'tony@fusionduotech.com';

-- 2. What's the user_id in public.profiles for tony@fusionduotech.com?
SELECT 
  'MASTER_DATA.PROFILES' as source,
  user_id,
  email,
  user_platform_id,
  created_at
FROM public.profiles
WHERE email = 'tony@fusionduotech.com';

-- 3. Check if they match
SELECT 
  'MISMATCH ANALYSIS' as check_type,
  au.id as auth_users_id,
  p.user_id as profiles_user_id,
  CASE 
    WHEN au.id = p.user_id THEN '✅ MATCH - All good!'
    ELSE '❌ MISMATCH - This is the problem!'
  END as status,
  'If mismatch, profiles.user_id needs to be updated to match auth.users.id' as solution
FROM auth.users au
FULL OUTER JOIN public.profiles p ON au.email = p.email
WHERE au.email = 'tony@fusionduotech.com' OR p.email = 'tony@fusionduotech.com';
