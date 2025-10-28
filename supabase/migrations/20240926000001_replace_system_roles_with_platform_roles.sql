-- Drop existing RPC functions that reference system_roles
DROP FUNCTION IF EXISTS get_system_roles();
DROP FUNCTION IF EXISTS sync_employee_system_roles(uuid, text[]);

-- Create get_platform_roles function (replacement for get_system_roles)
CREATE OR REPLACE FUNCTION get_platform_roles()
RETURNS TABLE (
  id uuid,
  role_name text,
  role_display_name text,
  privilege_level integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.id,
    pr.role_name,
    pr.role_display_name,
    pr.privilege_level,
    pr.is_active,
    pr.created_at,
    pr.updated_at
  FROM global.platform_roles pr
  WHERE pr.is_active = true
  ORDER BY pr.privilege_level DESC, pr.role_name;
END;
$$;

-- Create sync_employee_platform_roles function (replacement for sync_employee_system_roles)
CREATE OR REPLACE FUNCTION sync_employee_platform_roles(
  p_user_id uuid,
  p_role_names text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_record RECORD;
  user_platform_id_val text;
BEGIN
  -- Get user platform ID
  SELECT user_platform_id INTO user_platform_id_val
  FROM global.profiles
  WHERE user_id = p_user_id;
  
  IF user_platform_id_val IS NULL THEN
    RAISE EXCEPTION 'User not found or missing platform ID';
  END IF;
  
  -- Deactivate existing role assignments
  UPDATE global.user_role_assignments
  SET is_active = false, updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Add new role assignments
  FOR role_record IN 
    SELECT id FROM global.platform_roles 
    WHERE role_name = ANY(p_role_names) AND is_active = true
  LOOP
    INSERT INTO global.user_role_assignments (
      user_id,
      user_platform_id, 
      platform_role_id,
      is_active,
      assigned_by
    ) VALUES (
      p_user_id,
      user_platform_id_val,
      role_record.id,
      true,
      p_user_id
    )
    ON CONFLICT (user_id, platform_role_id) 
    DO UPDATE SET 
      is_active = true,
      updated_at = NOW();
  END LOOP;
  
  RETURN true;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_platform_roles() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION sync_employee_platform_roles(uuid, text[]) TO authenticated;