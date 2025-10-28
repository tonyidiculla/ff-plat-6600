-- ============================================================================
-- CORRECTED RLS POLICIES FOR user_to_role_assignment
-- ============================================================================
-- This script fixes the RLS policies to be more secure and complete
-- ============================================================================

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Allow platform admins to view all role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can insert role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can update role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Platform admins can delete role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Users can view their own role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Users can only see own assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "user_to_role_assignment_select_policy" ON public.user_to_role_assignment;

-- Step 2: Ensure helper function exists
CREATE OR REPLACE FUNCTION public.is_platform_admin(user_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_to_role_assignment ura
    JOIN public.platform_roles pr ON ura.role_id = pr.role_id
    WHERE ura.user_platform_id = (
      SELECT user_platform_id 
      FROM public.profiles 
      WHERE user_id = user_uid
      LIMIT 1
    )
    AND pr.role_name IN ('Platform Admin', 'Super Admin', 'System Admin')
    AND ura.is_active = true
  );
END;
$$;

-- Step 3: Create comprehensive RLS policies

-- SELECT Policy: Platform admins see all, users see only their own
CREATE POLICY "Allow platform admins and users to view role assignments"
ON public.user_to_role_assignment
FOR SELECT
TO authenticated  -- Changed from 'public' to 'authenticated' for security
USING (
  -- Platform admins can see all role assignments
  public.is_platform_admin(auth.uid())
  OR
  -- Regular users can only see their own role assignments
  user_platform_id = (
    SELECT user_platform_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  )
);

-- INSERT Policy: Only platform admins can insert role assignments
CREATE POLICY "Platform admins can insert role assignments"
ON public.user_to_role_assignment
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- UPDATE Policy: Only platform admins can update role assignments
CREATE POLICY "Platform admins can update role assignments"
ON public.user_to_role_assignment
FOR UPDATE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
);

-- DELETE Policy: Only platform admins can delete role assignments
CREATE POLICY "Platform admins can delete role assignments"
ON public.user_to_role_assignment
FOR DELETE
TO authenticated
USING (
  public.is_platform_admin(auth.uid())
);

-- Step 4: Enable RLS (if not already enabled)
ALTER TABLE public.user_to_role_assignment ENABLE ROW LEVEL SECURITY;

-- Step 5: Ensure proper grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_to_role_assignment TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin TO authenticated;

-- Step 6: Verify the policies
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN roles::text = '{public}' THEN '⚠️  PUBLIC (Security Risk)'
    WHEN roles::text = '{authenticated}' THEN '✅ AUTHENTICATED'
    ELSE roles::text 
  END as security_level
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_to_role_assignment'
ORDER BY cmd, policyname;

-- Step 7: Test query (should return count if you're admin)
SELECT COUNT(*) as total_role_assignments 
FROM public.user_to_role_assignment;
