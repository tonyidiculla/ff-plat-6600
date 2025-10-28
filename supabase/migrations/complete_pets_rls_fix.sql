-- ========================================
-- COMPLETE FIX FOR PETS RLS POLICIES
-- ========================================
-- This will completely reset and fix all RLS policies
-- for the public.pets table
-- ========================================

-- Step 1: Drop ALL existing policies
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

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies with simplified syntax

-- POLICY 1: Allow SELECT for authenticated users who own the pets
CREATE POLICY "authenticated_select_own_pets"
ON public.pets
FOR SELECT
TO authenticated
USING (
    user_platform_id IN (
        SELECT user_platform_id
        FROM public.profiles
        WHERE user_id = auth.uid()
    )
);

-- POLICY 2: Allow INSERT for authenticated users
CREATE POLICY "authenticated_insert_own_pets"
ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (
    user_platform_id IN (
        SELECT user_platform_id
        FROM public.profiles
        WHERE user_id = auth.uid()
    )
);

-- POLICY 3: Allow UPDATE for authenticated users who own the pets
CREATE POLICY "authenticated_update_own_pets"
ON public.pets
FOR UPDATE
TO authenticated
USING (
    user_platform_id IN (
        SELECT user_platform_id
        FROM public.profiles
        WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    user_platform_id IN (
        SELECT user_platform_id
        FROM public.profiles
        WHERE user_id = auth.uid()
    )
);

-- POLICY 4: Allow DELETE for authenticated users who own the pets
CREATE POLICY "authenticated_delete_own_pets"
ON public.pets
FOR DELETE
TO authenticated
USING (
    user_platform_id IN (
        SELECT user_platform_id
        FROM public.profiles
        WHERE user_id = auth.uid()
    )
);

-- Step 4: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    roles::text[] as applies_to,
    CASE 
        WHEN cmd = 'SELECT' THEN '✓ Read'
        WHEN cmd = 'INSERT' THEN '✓ Create'
        WHEN cmd = 'UPDATE' THEN '✓ Update'
        WHEN cmd = 'DELETE' THEN '✓ Delete'
    END as permission
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'pets'
ORDER BY cmd;

-- Step 5: Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'pets';
