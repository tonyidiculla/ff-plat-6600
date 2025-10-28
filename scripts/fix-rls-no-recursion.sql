-- ============================================================================
-- SIMPLIFIED RLS POLICIES - NO RECURSION
-- ============================================================================
-- This fixes the recursive issue by using a simpler approach
-- ============================================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow platform admins and users to view role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can insert role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can update role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can delete role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Allow platform admins to view all role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Users can view their own role assignments" ON public.user_to_role_assignment;

-- Step 2: Drop the problematic function (causes recursion)
DROP FUNCTION IF EXISTS public.is_platform_admin(uuid);

-- Step 3: Create a better helper function that uses a flag in profiles table
-- This assumes you have a column in profiles to mark admin users
-- Alternative: Check against a specific list of admin user_ids

CREATE OR REPLACE FUNCTION public.get_user_platform_id(user_uid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_platform_id 
  FROM public.profiles 
  WHERE user_id = user_uid
  LIMIT 1;
$$;

-- Step 4: Create simple, non-recursive policies

-- Option A: TEMPORARY - Allow all authenticated users to see all assignments
-- (Use this first to verify the app works, then we'll add proper restrictions)
CREATE POLICY "Authenticated users can view all role assignments"
ON public.user_to_role_assignment
FOR SELECT
TO authenticated
USING (true);  -- Temporarily allow all to test

-- INSERT: Only for specific admin users (replace with your admin user_platform_ids)
CREATE POLICY "Admins can insert role assignments"
ON public.user_to_role_assignment
FOR INSERT
TO authenticated
WITH CHECK (
  -- Replace 'H00000001' with your actual admin user platform IDs
  public.get_user_platform_id(auth.uid()) IN ('H00000001', 'H003mw6l9')
);

-- UPDATE: Only for specific admin users
CREATE POLICY "Admins can update role assignments"
ON public.user_to_role_assignment
FOR UPDATE
TO authenticated
USING (
  public.get_user_platform_id(auth.uid()) IN ('H00000001', 'H003mw6l9')
)
WITH CHECK (
  public.get_user_platform_id(auth.uid()) IN ('H00000001', 'H003mw6l9')
);

-- DELETE: Only for specific admin users
CREATE POLICY "Admins can delete role assignments"
ON public.user_to_role_assignment
FOR DELETE
TO authenticated
USING (
  public.get_user_platform_id(auth.uid()) IN ('H00000001', 'H003mw6l9')
);

-- Step 5: Enable RLS
ALTER TABLE public.user_to_role_assignment ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_to_role_assignment TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_platform_id TO authenticated;

-- Step 7: Verify
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_to_role_assignment'
ORDER BY cmd, policyname;

-- Test query
SELECT COUNT(*) as total_role_assignments 
FROM public.user_to_role_assignment;
