-- Create public schema and profiles table
-- This replaces the global.profiles approach with public.profiles

-- Create public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Create profiles table in public schema
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    platform_id TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    country TEXT DEFAULT 'United States',
    preferred_language TEXT DEFAULT 'en',
    is_active TEXT DEFAULT 'active' CHECK (is_active IN ('active', 'inactive', 'pending', 'suspended')),
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager', 'platform_admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to generate platform_id
CREATE OR REPLACE FUNCTION public.generate_platform_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric string
        new_id := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if this ID already exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE platform_id = new_id) INTO exists_check;
        
        -- If it doesn't exist, we can use it
        IF NOT exists_check THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id, 
        platform_id,
        email, 
        first_name, 
        last_name,
        phone,
        country,
        preferred_language
    )
    VALUES (
        NEW.id,
        public.generate_platform_id(),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'country', 'United States'),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to search user profiles
CREATE OR REPLACE FUNCTION public.search_user_profiles(
    search_term TEXT DEFAULT '',
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
    user_id UUID,
    platform_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    preferred_language TEXT,
    is_active TEXT,
    role TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.platform_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.country,
        p.preferred_language,
        p.is_active,
        p.role,
        p.avatar_url,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE 
        (search_term = '' OR 
         p.first_name ILIKE '%' || search_term || '%' OR
         p.last_name ILIKE '%' || search_term || '%' OR
         p.email ILIKE '%' || search_term || '%' OR
         p.platform_id ILIKE '%' || search_term || '%')
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user profile
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(
    user_id UUID,
    platform_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    preferred_language TEXT,
    is_active TEXT,
    role TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.user_id,
        p.platform_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.country,
        p.preferred_language,
        p.is_active,
        p.role,
        p.avatar_url,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
    profile_updates JSONB
)
RETURNS TABLE(
    user_id UUID,
    platform_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    preferred_language TEXT,
    is_active TEXT,
    role TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        first_name = COALESCE(profile_updates->>'first_name', first_name),
        last_name = COALESCE(profile_updates->>'last_name', last_name),
        phone = COALESCE(profile_updates->>'phone', phone),
        country = COALESCE(profile_updates->>'country', country),
        preferred_language = COALESCE(profile_updates->>'preferred_language', preferred_language),
        avatar_url = COALESCE(profile_updates->>'avatar_url', avatar_url),
        updated_at = NOW()
    WHERE profiles.user_id = auth.uid();

    RETURN QUERY
    SELECT 
        p.user_id,
        p.platform_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.country,
        p.preferred_language,
        p.is_active,
        p.role,
        p.avatar_url,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all profiles
CREATE POLICY "Users can read all profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create a generic SQL execution function for direct access
CREATE OR REPLACE FUNCTION public.exec_sql(
    query TEXT,
    params TEXT[] DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- This is a simplified version - in production you'd want more security
    EXECUTE query USING VARIADIC params INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.search_user_profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.generate_platform_id TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.exec_sql TO authenticated, anon;