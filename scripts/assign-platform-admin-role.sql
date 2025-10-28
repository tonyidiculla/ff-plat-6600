-- ============================================================
-- ASSIGN PLATFORM ADMIN ROLE TO USER
-- ============================================================
-- This script assigns the platform_admin role to a user
-- Run this in Supabase SQL Editor if you can't see pets/EMR data
-- due to RLS policies blocking access

-- Step 1: Check current role assignments for user H00000001
SELECT 
  ura.user_platform_id,
  ura.system_role_id,
  pr.role_name,
  pr.display_name,
  ura.is_active
FROM public.user_to_role_assignment ura
JOIN public.platform_roles pr ON pr.id = ura.system_role_id
WHERE ura.user_platform_id = 'H00000001';

-- Step 2: Check if platform_admin role exists
SELECT id, role_name, display_name, privilege_level
FROM public.platform_roles
WHERE role_name IN ('platform_admin', 'super_admin');

-- Step 3: Get the user's auth.uid from profiles
SELECT user_id, user_platform_id, first_name, last_name, email
FROM public.profiles
WHERE user_platform_id = 'H00000001';

-- Step 4: Assign platform_admin role to user H00000001
-- IMPORTANT: Replace <USER_AUTH_UID> with the actual auth.uid from Step 3
-- IMPORTANT: Replace <PLATFORM_ADMIN_ROLE_ID> with the actual role id from Step 2

INSERT INTO public.user_to_role_assignment (
  user_id,
  user_platform_id,
  system_role_id,
  is_active,
  created_at,
  updated_at
)
VALUES (
  '<USER_AUTH_UID>',  -- Replace with actual user_id from profiles
  'H00000001',
  '<PLATFORM_ADMIN_ROLE_ID>',  -- Replace with actual platform_admin role id
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id, system_role_id) 
DO UPDATE SET 
  is_active = true,
  updated_at = NOW();

-- Step 5: Verify the assignment
SELECT 
  ura.user_platform_id,
  ura.system_role_id,
  pr.role_name,
  pr.display_name,
  ura.is_active
FROM public.user_to_role_assignment ura
JOIN public.platform_roles pr ON pr.id = ura.system_role_id
WHERE ura.user_platform_id = 'H00000001'
  AND ura.is_active = true;
