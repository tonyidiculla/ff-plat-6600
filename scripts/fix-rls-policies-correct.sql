-- ============================================================
-- FIX RLS POLICIES - CORRECT VERSION
-- ============================================================
-- The issue: RLS policies were trying to join user_to_role_assignment.user_id with auth.uid()
-- But user_to_role_assignment uses user_platform_id (TEXT), not user_id (UUID)
-- Solution: Join through profiles table to map auth.uid() → user_platform_id → roles

-- ============================================================
-- FIX PETS TABLE RLS POLICIES
-- ============================================================

-- Policy 4a: Platform admins can view ALL pets across organizations
DROP POLICY IF EXISTS "Platform admins can view all pets" ON public.pets;

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

-- Policy 4b: Platform admins can insert pets in any organization
DROP POLICY IF EXISTS "Platform admins can insert pets anywhere" ON public.pets;

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

-- Policy 4c: Platform admins can update any pet
DROP POLICY IF EXISTS "Platform admins can update any pet" ON public.pets;

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
  )
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

-- Policy 4d: Platform admins can delete any pet
DROP POLICY IF EXISTS "Platform admins can delete any pet" ON public.pets;

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

-- ============================================================
-- FIX EMR_RECORDS_MASTER TABLE RLS POLICIES
-- ============================================================

-- Policy 4a: Platform admins can view ALL EMR records
DROP POLICY IF EXISTS "Platform admins can view all emr records" ON public.emr_records_master;

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

-- Policy 4b: Platform admins can insert EMR records anywhere
DROP POLICY IF EXISTS "Platform admins can insert emr records anywhere" ON public.emr_records_master;

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

-- Policy 4c: Platform admins can update any EMR record
DROP POLICY IF EXISTS "Platform admins can update any emr record" ON public.emr_records_master;

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
  )
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

-- Policy 4d: Platform admins can delete any EMR record
DROP POLICY IF EXISTS "Platform admins can delete any emr record" ON public.emr_records_master;

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

-- ============================================================
-- FIX EMR_RECORDS_IOT TABLE RLS POLICIES
-- ============================================================

-- Policy 4a: Platform admins can view ALL IoT EMR records
DROP POLICY IF EXISTS "Platform admins can view all iot emr records" ON public.emr_records_iot;

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

-- Policy 4b: Platform admins can insert IoT EMR records anywhere
DROP POLICY IF EXISTS "Platform admins can insert iot emr records anywhere" ON public.emr_records_iot;

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

-- Policy 4c: Platform admins can update any IoT EMR record
DROP POLICY IF EXISTS "Platform admins can update any iot emr record" ON public.emr_records_iot;

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
  )
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

-- Policy 4d: Platform admins can delete any IoT EMR record
DROP POLICY IF EXISTS "Platform admins can delete any iot emr record" ON public.emr_records_iot;

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

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Verify policies were created
SELECT 
  '=== VERIFICATION: POLICIES CREATED ===' as section,
  tablename,
  policyname,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pets', 'emr_records_master', 'emr_records_iot')
  AND policyname LIKE '%Platform admins%'
ORDER BY tablename, policyname;

-- Test: Run as authenticated user to see if policies work
-- NOTE: This will only work if you run it while logged in as the platform admin user
SELECT 
  '=== TEST: CAN PLATFORM ADMIN SEE DATA? ===' as section,
  (SELECT COUNT(*) FROM public.pets) as pets_visible,
  (SELECT COUNT(*) FROM public.emr_records_master) as emr_master_visible,
  (SELECT COUNT(*) FROM public.emr_records_iot) as emr_iot_visible;
