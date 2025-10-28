-- Check what role 98c07fc3-7f6f-4fc4-a2e8-d06c3e32bca2 actually is

SELECT 
  id,
  role_name,
  display_name,
  privilege_level,
  description
FROM public.platform_roles
WHERE id = '98c07fc3-7f6f-4fc4-a2e8-d06c3e32bca2';

-- Also check ALL roles to see what's available
SELECT 
  id,
  role_name,
  display_name,
  privilege_level
FROM public.platform_roles
ORDER BY privilege_level DESC;
