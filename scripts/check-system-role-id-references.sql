-- Check for any database functions or policies that reference system_role_id

-- 1. Check all RLS policy definitions for system_role_id
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN qual::text LIKE '%system_role_id%' THEN 'USING clause has system_role_id'
    WHEN with_check::text LIKE '%system_role_id%' THEN 'WITH CHECK clause has system_role_id'
    ELSE 'No system_role_id found'
  END as issue
FROM pg_policies
WHERE schemaname = 'public'
  AND (qual::text LIKE '%system_role_id%' OR with_check::text LIKE '%system_role_id%');

-- 2. Verify the actual column name in user_to_role_assignment
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_to_role_assignment'
ORDER BY ordinal_position;

-- 3. Check what data is actually in user_to_role_assignment for user H00000001
SELECT 
  user_id,
  user_platform_id,
  platform_role_id,
  is_active,
  updated_at
FROM public.user_to_role_assignment
WHERE user_platform_id = 'H00000001';
