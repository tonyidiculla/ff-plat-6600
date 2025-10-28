-- ========================================
-- RE-ENABLE RLS AND APPLY POLICIES
-- ========================================
-- This script will:
-- 1. Check if RLS is enabled
-- 2. Disable RLS temporarily
-- 3. Re-enable RLS
-- 4. Re-create all policies
-- ========================================

-- First, let's check current state
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'pets';

-- Disable RLS temporarily
ALTER TABLE public.pets DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
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
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- ========================================
-- POLICY 1: Service Role Bypass (CRITICAL!)
-- ========================================
CREATE POLICY "service_role_all_access"
ON public.pets
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- POLICY 2: User SELECT
-- ========================================
CREATE POLICY "user_select_own_pets"
ON public.pets
AS PERMISSIVE
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
CREATE POLICY "user_insert_own_pets"
ON public.pets
AS PERMISSIVE
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
CREATE POLICY "user_update_own_pets"
ON public.pets
AS PERMISSIVE
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
CREATE POLICY "user_delete_own_pets"
ON public.pets
AS PERMISSIVE
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
-- VERIFICATION
-- ========================================
-- Check that all policies exist
SELECT 
    policyname,
    cmd,
    roles::text[] as applies_to,
    CASE 
        WHEN policyname LIKE '%service%' THEN '🔑 Service Role (Backend)'
        WHEN cmd = 'SELECT' THEN '👁️ Read Access'
        WHEN cmd = 'INSERT' THEN '➕ Create Access'
        WHEN cmd = 'UPDATE' THEN '✏️ Update Access'
        WHEN cmd = 'DELETE' THEN '🗑️ Delete Access'
        ELSE cmd
    END as description
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'pets'
ORDER BY 
    CASE 
        WHEN policyname LIKE '%service%' THEN 1
        ELSE 2
    END,
    cmd;
