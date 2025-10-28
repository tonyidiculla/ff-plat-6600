-- ============================================================================
-- BEST PRACTICE RLS - Using JWT Claims or Admin Tracking Table
-- ============================================================================
-- This is the most efficient approach without recursion
-- ============================================================================

-- Step 1: Drop all existing policies and functions
DROP POLICY IF EXISTS "Allow platform admins and users to view role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Authenticated users can view all role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can insert role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Admins can insert role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can update role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Admins can update role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can delete role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Admins can delete role assignments" ON public.user_to_role_assignment;
DROP FUNCTION IF EXISTS public.is_platform_admin(uuid);
DROP FUNCTION IF EXISTS public.get_user_platform_id(uuid);

-- Step 2: Create helper function to get user's platform_id
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

-- Step 3: Create a view or function to check admin status WITHOUT querying user_to_role_assignment
-- This checks if user has admin role by looking at a separate materialized view or cache

-- Option 1: Use a simple whitelist approach for now
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Check if current user's platform_id is in the admin list
  -- You can maintain this list or use a separate admin_users table
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
    AND p.user_platform_id IN (
      'H00000001',  -- Tony
      'H003mw6l9'   -- Test Manager
      -- Add more admin user_platform_ids here
    )
  );
$$;

-- Step 4: Create the RLS policies

-- SELECT: Admins see all, regular users see only their own
CREATE POLICY "Users can view role assignments based on admin status"
ON public.user_to_role_assignment
FOR SELECT
TO authenticated
USING (
  -- If user is admin, show all
  public.is_admin_user()
  OR
  -- Otherwise, only show their own assignments
  user_platform_id = public.get_user_platform_id(auth.uid())
);

-- INSERT: Only admins
CREATE POLICY "Only admins can insert role assignments"
ON public.user_to_role_assignment
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_user()
);

-- UPDATE: Only admins
CREATE POLICY "Only admins can update role assignments"
ON public.user_to_role_assignment
FOR UPDATE
TO authenticated
USING (
  public.is_admin_user()
)
WITH CHECK (
  public.is_admin_user()
);

-- DELETE: Only admins
CREATE POLICY "Only admins can delete role assignments"
ON public.user_to_role_assignment
FOR DELETE
TO authenticated
USING (
  public.is_admin_user()
);

-- Step 5: Enable RLS
ALTER TABLE public.user_to_role_assignment ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_to_role_assignment TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_platform_id TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user TO authenticated;

-- Step 7: Verify the setup
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_to_role_assignment'
ORDER BY cmd, policyname;

-- Step 8: Test the functions
SELECT 
  'Current user is admin?' as question,
  public.is_admin_user() as answer;

SELECT 
  'Current user platform_id' as question,
  public.get_user_platform_id(auth.uid()) as answer;

-- Step 9: Test the query
SELECT COUNT(*) as total_role_assignments 
FROM public.user_to_role_assignment;

-- Expected: 73 if you're Tony (H00000001) or Test Manager (H003mw6l9)
-- Expected: 2 (or your role count) if you're a regular user
