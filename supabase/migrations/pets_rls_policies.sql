-- ============================================================
-- RLS POLICIES FOR public.pets TABLE
-- ============================================================
-- This file contains all Row Level Security policies for the pets table
-- Run these in Supabase SQL Editor

-- ============================================================
-- STEP 1: Enable RLS on pets table
-- ============================================================
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Service Role Policy (Admin/Backend Access)
-- ============================================================
-- This policy allows the service role to bypass RLS completely
-- Used for admin operations and backend processes

DROP POLICY IF EXISTS "Service role has full access to pets" ON public.pets;

CREATE POLICY "Service role has full access to pets"
  ON public.pets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 3: Authenticated User Policies (User Ownership-based)
-- ============================================================
-- Pets are owned by users, not organizations
-- Access is controlled via user_platform_id

-- Policy 3a: SELECT - Users can view their own pets
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;

CREATE POLICY "Users can view their own pets"
  ON public.pets
  FOR SELECT
  TO authenticated
  USING (
    user_platform_id IN (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy 3b: INSERT - Users can create pets for themselves
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;

CREATE POLICY "Users can insert their own pets"
  ON public.pets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_platform_id IN (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy 3c: UPDATE - Users can update their own pets
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;

CREATE POLICY "Users can update their own pets"
  ON public.pets
  FOR UPDATE
  TO authenticated
  USING (
    user_platform_id IN (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    user_platform_id IN (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy 3d: DELETE - Users can delete their own pets
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

CREATE POLICY "Users can delete their own pets"
  ON public.pets
  FOR DELETE
  TO authenticated
  USING (
    user_platform_id IN (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- ============================================================
-- STEP 4: Platform Admin Policies (Cross-Organization Access)
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
      JOIN public.platform_roles pr ON pr.id = ura.role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
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
      JOIN public.platform_roles pr ON pr.id = ura.role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
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
      JOIN public.platform_roles pr ON pr.id = ura.role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.user_to_role_assignment ura
      JOIN public.platform_roles pr ON pr.id = ura.role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
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
      JOIN public.platform_roles pr ON pr.id = ura.role_id
      WHERE ura.user_id = auth.uid()
      AND pr.role_name IN ('platform_admin', 'super_admin')
    )
  );

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'pets';

-- List all policies on pets table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'pets'
ORDER BY policyname;

-- ============================================================
-- POLICY SUMMARY
-- ============================================================

/*
📋 RLS POLICY STRUCTURE:

1. SERVICE ROLE (service_role)
   - Full access to all pets (bypasses RLS)
   - Used for backend operations

2. PET OWNERS (authenticated)
   - Can SELECT their own pets (matched by user_platform_id)
   - Can INSERT pets for themselves
   - Can UPDATE their own pets
   - Can DELETE their own pets
   - Ownership determined by profiles.platform_id = pets.user_platform_id

3. PLATFORM ADMINS (authenticated with admin role)
   - Can SELECT all pets across all users
   - Can INSERT pets for any user
   - Can UPDATE any pet
   - Can DELETE any pet
   - Admin role: 'platform_admin' or 'super_admin'

🔒 SECURITY FEATURES:
- User-based ownership isolation via user_platform_id
- Role-based access control for admins
- Prevents users from accessing other users' pets
- Service role for backend operations
- Authenticated users only (no anonymous access)

⚙️ REQUIREMENTS:
- public.profiles table with user_platform_id column
- public.pets table with user_platform_id column
- public.user_to_role_assignment table
- public.platform_roles table with role_name column
- Supabase auth.uid() function

🐾 PET OWNERSHIP MODEL:
- Pets belong to users (not organizations)
- pets.user_platform_id = profiles.user_platform_id (direct match)
- Users can only manage their own pets
- Admins can manage all pets
*/
