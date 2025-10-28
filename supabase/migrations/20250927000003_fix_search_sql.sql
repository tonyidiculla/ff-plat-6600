-- Fix the search function SQL issue
CREATE OR REPLACE FUNCTION search_user_profiles(
  search_term TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Search in auth.users table which exists in all Supabase projects
  WITH user_search AS (
    SELECT 
      id,
      email,
      COALESCE(raw_user_meta_data->>'first_name', '') as first_name,
      COALESCE(raw_user_meta_data->>'last_name', '') as last_name,
      created_at
    FROM auth.users
    WHERE 
      (email ILIKE '%' || search_term || '%' OR
       raw_user_meta_data->>'first_name' ILIKE '%' || search_term || '%' OR
       raw_user_meta_data->>'last_name' ILIKE '%' || search_term || '%') AND
      email_confirmed_at IS NOT NULL -- Only return confirmed users
    ORDER BY 
      CASE 
        WHEN email ILIKE search_term || '%' THEN 1
        WHEN raw_user_meta_data->>'first_name' ILIKE search_term || '%' OR raw_user_meta_data->>'last_name' ILIKE search_term || '%' THEN 2
        ELSE 3
      END,
      created_at DESC
    LIMIT limit_count
  )
  SELECT jsonb_build_object(
    'success', true,
    'data', COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'user_id', id,
        'email', email,
        'first_name', first_name,
        'last_name', last_name
      )
    ), '[]'::jsonb)
  ) INTO result
  FROM user_search;
  
  RETURN result;
END;
$$;