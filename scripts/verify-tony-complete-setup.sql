-- Verify tony@fusionduotech.com has a complete setup

SELECT 
  'tony@fusionduotech.com FULL SETUP' as check,
  au.id as auth_user_id,
  au.email,
  p.user_id as profile_user_id,
  p.user_platform_id,
  ura.platform_role_id,
  pr.role_name,
  pr.display_name,
  ura.is_active
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
LEFT JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
LEFT JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE au.email = 'tony@fusionduotech.com';
