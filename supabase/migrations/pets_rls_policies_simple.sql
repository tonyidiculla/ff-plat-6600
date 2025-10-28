-- ========================================
-- RLS POLICIES FOR public.pets TABLE
-- ========================================
-- This migration sets up Row Level Security policies for the pets table.
-- Pets are user-owned entities, linked via user_platform_id.
-- No admin role policies needed - pets are personal to users.
--
-- Tables referenced:
-- - public.pets (main table)
-- - public.profiles (for user verification)
--
-- Policy Structure:
-- 1. Service role bypass (full access for backend)
-- 2. User SELECT (users can view their own pets)
-- 3. User INSERT (users can add pets)
-- 4. User UPDATE (users can update their pets)
-- 5. User DELETE (users can delete their pets)
-- ========================================

-- Drop ALL existing policies first (clean slate)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'pets'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.pets', policy_record.policyname);
    END LOOP;
END $$;

-- ========================================
-- POLICY 1: Service Role Bypass
-- ========================================
-- The service role (backend) needs full access for system operations
CREATE POLICY "Service role has full access to pets"
ON public.pets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- POLICY 2: User SELECT
-- ========================================
-- Users can view their own pets based on user_platform_id ownership
CREATE POLICY "Users can view their own pets"
ON public.pets
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_platform_id = pets.user_platform_id
    )
);

-- ========================================
-- POLICY 3: User INSERT
-- ========================================
-- Users can insert new pets if they own the user_platform_id
CREATE POLICY "Users can insert their own pets"
ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_platform_id = pets.user_platform_id
    )
);

-- ========================================
-- POLICY 4: User UPDATE
-- ========================================
-- Users can update their own pets
CREATE POLICY "Users can update their own pets"
ON public.pets
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_platform_id = pets.user_platform_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_platform_id = pets.user_platform_id
    )
);

-- ========================================
-- POLICY 5: User DELETE
-- ========================================
-- Users can delete their own pets
CREATE POLICY "Users can delete their own pets"
ON public.pets
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE profiles.user_id = auth.uid()
        AND profiles.user_platform_id = pets.user_platform_id
    )
);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify policies are active:

-- 1. Check policy count (should be 5)
-- SELECT COUNT(*) as policy_count FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'pets';

-- 2. List all policies
-- SELECT policyname, cmd, roles::text[] 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'pets'
-- ORDER BY policyname;
