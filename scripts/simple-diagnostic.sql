-- Simple diagnostic - all in one query
SELECT 
  'My Auth UID' as info_type,
  auth.uid()::text as value
UNION ALL
SELECT 
  'My Email',
  auth.email()::text
UNION ALL
SELECT 
  'My user_platform_id',
  user_platform_id
FROM public.profiles
WHERE user_id = auth.uid()
UNION ALL
SELECT 
  'My Role',
  pr.role_name
FROM public.profiles p
JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
WHERE p.user_id = auth.uid()
  AND ura.is_active = true
UNION ALL
SELECT 
  'Policy Condition Result',
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    ) THEN 'TRUE - Policy should allow access'
    ELSE 'FALSE - Policy will block access'
  END
UNION ALL
SELECT 
  'Pets I Can See',
  COUNT(*)::text
FROM public.pets
UNION ALL
SELECT 
  'EMR Master I Can See',
  COUNT(*)::text
FROM public.emr_records_master
UNION ALL
SELECT 
  'EMR IoT I Can See',
  COUNT(*)::text
FROM public.emr_records_iot
UNION ALL
SELECT 
  'Total Pets in DB (bypassing RLS)',
  (SELECT COUNT(*)::text FROM public.pets WHERE true)
UNION ALL
SELECT 
  'Total EMR Master in DB (bypassing RLS)',
  (SELECT COUNT(*)::text FROM public.emr_records_master WHERE true)
UNION ALL
SELECT 
  'Total EMR IoT in DB (bypassing RLS)',
  (SELECT COUNT(*)::text FROM public.emr_records_iot WHERE true);
