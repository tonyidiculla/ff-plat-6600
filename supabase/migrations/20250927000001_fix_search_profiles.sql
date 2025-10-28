-- Create simplified CRUD RPC function for profiles table based on actual structure
-- Drop the existing function first to avoid conflicts
DROP FUNCTION IF EXISTS crud_profiles;
DROP FUNCTION IF EXISTS search_user_profiles;

-- Create a simple search function that works with the actual table structure
CREATE OR REPLACE FUNCTION search_user_profiles(
  search_term TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Try to search in global.profiles first, fallback to public.profiles
  BEGIN
    RETURN (
      SELECT jsonb_build_object(
        'success', true,
        'data', COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', id,
            'user_id', user_id,
            'email', email,
            'first_name', first_name,
            'last_name', last_name
          )
        ), '[]'::jsonb)
      )
      FROM global.profiles
      WHERE 
        (email ILIKE '%' || search_term || '%' OR
         first_name ILIKE '%' || search_term || '%' OR
         last_name ILIKE '%' || search_term || '%') AND
        is_approved = true
      ORDER BY 
        CASE 
          WHEN email ILIKE search_term || '%' THEN 1
          WHEN first_name ILIKE search_term || '%' OR last_name ILIKE search_term || '%' THEN 2
          ELSE 3
        END,
        created_at DESC
      LIMIT limit_count
    );
  EXCEPTION 
    WHEN others THEN
      -- Fallback to public.profiles if global.profiles doesn't exist or has different structure
      RETURN (
        SELECT jsonb_build_object(
          'success', true,
          'data', COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', id,
              'user_id', user_id,
              'email', email,
              'first_name', first_name,
              'last_name', last_name
            )
          ), '[]'::jsonb)
        )
        FROM profiles
        WHERE 
          (email ILIKE '%' || search_term || '%' OR
           first_name ILIKE '%' || search_term || '%' OR
           last_name ILIKE '%' || search_term || '%') AND
          is_approved = true
        ORDER BY 
          CASE 
            WHEN email ILIKE search_term || '%' THEN 1
            WHEN first_name ILIKE search_term || '%' OR last_name ILIKE search_term || '%' THEN 2
            ELSE 3
          END,
          created_at DESC
        LIMIT limit_count
      );
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION search_user_profiles TO authenticated;