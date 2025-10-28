-- Create a function to get user profiles for the frontend

CREATE OR REPLACE FUNCTION public.get_user_profiles_for_assignment()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'user_id', user_id,
            'first_name', first_name,
            'last_name', last_name,
            'email', email,
            'is_active', is_active
        )
    ) INTO result_data
    FROM global.profiles
    WHERE is_active = true
    ORDER BY first_name, last_name;
    
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(result_data, '[]'::json)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_profiles_for_assignment TO service_role, authenticated, anon;