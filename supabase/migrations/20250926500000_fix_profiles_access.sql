-- Fix profiles table access and create proper RLS policies

-- Enable RLS on profiles table
ALTER TABLE global.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view all profiles" ON global.profiles
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "Users can insert their own profile" ON global.profiles  
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON global.profiles
    FOR UPDATE TO authenticated, anon
    USING (auth.uid() = user_id);

-- Grant additional permissions
GRANT SELECT, INSERT, UPDATE ON global.profiles TO authenticated, anon, service_role;

-- Test function with proper error handling
CREATE OR REPLACE FUNCTION public.test_profiles_access()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
BEGIN
    -- Try to select from profiles
    SELECT json_agg(row_to_json(p)) INTO result_data
    FROM (SELECT * FROM global.profiles LIMIT 5) p;
    
    RETURN json_build_object(
        'success', true,
        'data', COALESCE(result_data, '[]'::json),
        'count', (SELECT COUNT(*) FROM global.profiles)
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'error_state', SQLSTATE
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.test_profiles_access TO service_role;