-- ============================================================
-- FIX RLS POLICIES - Update column name from system_role_id to platform_role_id
-- ============================================================
-- The RLS policies were using wrong column name: system_role_id
-- Should be: platform_role_id (as per the actual table schema)
-- Run this in Supabase SQL Editor to fix the policies

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
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
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
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
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

-- Policy 4d: Platform admins can delete any pet
DROP POLICY IF EXISTS "Platform admins can delete any pet" ON public.pets;

CREATE POLICY "Platform admins can delete any pet"
  ON public.pets
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

-- ============================================================
-- FIX EMR RECORDS TABLE RLS POLICIES
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
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
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
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.platform_role_id
      WHERE ura.user_id = auth.uid()
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

-- Policy 4d: Platform admins can delete any EMR record
DROP POLICY IF EXISTS "Platform admins can delete any emr record" ON public.emr_records_master;

CREATE POLICY "Platform admins can delete any emr record"
  ON public.emr_records_master
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

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if the policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('pets', 'emr_records_master')
  AND policyname LIKE '%Platform admins%'
ORDER BY tablename, policyname;

-- Test if current user can see pets (should return count > 0 if you're platform admin)
SELECT COUNT(*) as total_pets FROM public.pets;

-- Test if current user can see EMR records (should return count > 0 if you're platform admin)
SELECT COUNT(*) as total_emr_records FROM public.emr_records_master;
