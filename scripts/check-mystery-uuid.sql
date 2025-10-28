-- Check what the UUID 3748560f-d387-4c4e-808f-72f49798b881 belongs to

-- 1. Is it in auth.users?
SELECT 
  'AUTH.USERS' as source,
  id,
  email,
  created_at
FROM auth.users
WHERE id = '3748560f-d387-4c4e-808f-72f49798b881';

-- 2. Is it in profiles?
SELECT 
  'PROFILES' as source,
  user_id,
  user_platform_id,
  email,
  created_at
FROM public.profiles
WHERE user_id = '3748560f-d387-4c4e-808f-72f49798b881';

-- 3. Check all users in auth.users vs profiles to see if there are orphaned entries
SELECT 
  'ALL AUTH USERS vs PROFILES' as check,
  au.id as auth_user_id,
  au.email as auth_email,
  p.user_id as profile_user_id,
  p.email as profile_email,
  p.user_platform_id,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ AUTH USER WITHOUT PROFILE'
    ELSE '✅ Has profile'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
LIMIT 20;
