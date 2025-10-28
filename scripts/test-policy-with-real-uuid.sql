-- This SQL won't work in browser context, but let's verify the policy logic one more time
-- Run this in Supabase SQL Editor with SERVICE ROLE

-- Simulate what the policy checks for user_id = 3748560f-d387-4c4e-808f-72f49798b881
SELECT 
  'Policy would allow access' as result,
  p.user_id as auth_uuid,
  p.user_platform_id,
  p.email,
  pr.role_name,
  ura.is_active
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.user_id = '3748560f-d387-4c4e-808f-72f49798b881'
  AND pr.role_name IN ('platform_admin', 'super_admin')
  AND ura.is_active = true;

-- If the above returns a row, the policy SHOULD work
-- If it returns nothing, something is wrong with the data
