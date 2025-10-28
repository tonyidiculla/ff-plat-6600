-- CLEAN UP: Drop ALL platform admin policies (old and new) then recreate
-- This ensures no conflicts between old and new policies

-- ============================================================
-- DROP ALL PLATFORM ADMIN POLICIES
-- ============================================================

-- Pets table
DROP POLICY IF EXISTS "Platform admins can view all pets" ON public.pets;
DROP POLICY IF EXISTS "Platform admins can insert pets anywhere" ON public.pets;
DROP POLICY IF EXISTS "Platform admins can update any pet" ON public.pets;
DROP POLICY IF EXISTS "Platform admins can delete any pet" ON public.pets;

-- EMR Records Master table
DROP POLICY IF EXISTS "Platform admins can view all emr records" ON public.emr_records_master;
DROP POLICY IF EXISTS "Platform admins can insert emr records anywhere" ON public.emr_records_master;
DROP POLICY IF EXISTS "Platform admins can update any emr record" ON public.emr_records_master;
DROP POLICY IF EXISTS "Platform admins can delete any emr record" ON public.emr_records_master;

-- EMR Records IoT table  
DROP POLICY IF EXISTS "Platform admins can view all iot emr records" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can view all iot records" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can insert iot emr records anywhere" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can insert iot records anywhere" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can update any iot emr record" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can update any iot record" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can delete any iot emr record" ON public.emr_records_iot;
DROP POLICY IF EXISTS "Platform admins can delete any iot record" ON public.emr_records_iot;

SELECT 'All old platform admin policies dropped' as status;

-- ============================================================
-- CREATE FRESH PLATFORM ADMIN POLICIES
-- ============================================================

-- PETS TABLE
CREATE POLICY "Platform admins can view all pets"
  ON public.pets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can insert pets anywhere"
  ON public.pets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can update any pet"
  ON public.pets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can delete any pet"
  ON public.pets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

-- EMR_RECORDS_MASTER TABLE
CREATE POLICY "Platform admins can view all emr records"
  ON public.emr_records_master
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can insert emr records anywhere"
  ON public.emr_records_master
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can update any emr record"
  ON public.emr_records_master
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can delete any emr record"
  ON public.emr_records_master
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

-- EMR_RECORDS_IOT TABLE
CREATE POLICY "Platform admins can view all iot emr records"
  ON public.emr_records_iot
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can insert iot emr records anywhere"
  ON public.emr_records_iot
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can update any iot emr record"
  ON public.emr_records_iot
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

CREATE POLICY "Platform admins can delete any iot emr record"
  ON public.emr_records_iot
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles p
      JOIN public.user_to_role_assignment ura ON p.user_platform_id = ura.user_platform_id
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE p.user_id = auth.uid()
        AND pr.role_name IN ('platform_admin', 'super_admin')
        AND ura.is_active = true
    )
  );

SELECT 'All platform admin policies recreated successfully!' as status;

-- Verify policies were created
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pets', 'emr_records_master', 'emr_records_iot')
  AND policyname LIKE '%Platform admins%'
GROUP BY tablename
ORDER BY tablename;
