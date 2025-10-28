-- Check current RLS policies on user_to_role_assignment
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_to_role_assignment';

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can view their own role assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "Users can only see own assignments" ON public.user_to_role_assignment;
DROP POLICY IF EXISTS "user_to_role_assignment_select_policy" ON public.user_to_role_assignment;

-- Create comprehensive RLS policy for platform admins and regular users
-- Platform admins can see all role assignments
-- Regular users can only see their own role assignments

-- First, let's create a helper function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(user_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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
    )
    AND pr.role_name IN ('Platform Admin', 'Super Admin', 'System Admin')
    AND ura.is_active = true
  );
END;
$$;

-- Create the SELECT policy for user_to_role_assignment
CREATE POLICY "Allow platform admins to view all role assignments"
ON public.user_to_role_assignment
FOR SELECT
USING (
  -- Allow if user is platform admin
  public.is_platform_admin(auth.uid())
  OR
  -- Allow users to see their own role assignments
  user_platform_id = (
    SELECT user_platform_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Ensure RLS is enabled
ALTER TABLE public.user_to_role_assignment ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.user_to_role_assignment TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin TO authenticated;

-- Verify the new policy
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_to_role_assignment';
