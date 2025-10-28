-- Ensure global.profiles table exists and create trigger to auto-create profiles for new users

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS global.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    is_active TEXT DEFAULT 'active' CHECK (is_active IN ('active', 'inactive', 'pending', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or replace function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO global.profiles (user_id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create profile when user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get or create user profile
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(p_user_id UUID, p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Try to get existing profile
    SELECT * INTO profile_record
    FROM global.profiles
    WHERE user_id = p_user_id;
    
    -- If profile doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO global.profiles (user_id, email, first_name, last_name)
        VALUES (p_user_id, p_email, 'User', '')
        RETURNING * INTO profile_record;
    END IF;
    
    RETURN row_to_json(profile_record);
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA global TO authenticated, anon;
GRANT ALL ON global.profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_profile TO authenticated, anon, service_role;