-- ============================================================
-- ADD PLATFORM ADMIN RLS POLICIES TO emr_records_iot TABLE
-- ============================================================
-- This adds the same platform admin policies that exist on emr_records_master
-- Run this in Supabase SQL Editor

-- Policy: Platform admins can view ALL IoT records
DROP POLICY IF EXISTS "Platform admins can view all iot records" ON public.emr_records_iot;

CREATE POLICY "Platform admins can view all iot records"
  ON public.emr_records_iot
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
    )
  );

-- Policy: Platform admins can insert IoT records anywhere
DROP POLICY IF EXISTS "Platform admins can insert iot records anywhere" ON public.emr_records_iot;

CREATE POLICY "Platform admins can insert iot records anywhere"
  ON public.emr_records_iot
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
    )
  );

-- Policy: Platform admins can update any IoT record
DROP POLICY IF EXISTS "Platform admins can update any iot record" ON public.emr_records_iot;

CREATE POLICY "Platform admins can update any iot record"
  ON public.emr_records_iot
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
    )
  );

-- Policy: Platform admins can delete any IoT record
DROP POLICY IF EXISTS "Platform admins can delete any iot record" ON public.emr_records_iot;

CREATE POLICY "Platform admins can delete any iot record"
  ON public.emr_records_iot
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
      AND ura.is_active = true
    )
  );

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'emr_records_iot'
  AND policyname LIKE '%Platform admins%'
ORDER BY policyname;

-- Test if you can now count IoT records
SELECT COUNT(*) as iot_records_i_can_see FROM public.emr_records_iot;
