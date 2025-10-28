-- Safe migration for Platform Admin Portal
-- Works with existing public.profiles table structure
-- DOES NOT modify existing table or data - only adds missing functions

-- Create function to get current user profile (using existing table structure)
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE(
    id BIGINT,
    user_id UUID,
    user_platform_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    date_of_birth DATE,
    preferred_language TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    stripe_customer_id TEXT,
    is_active BOOLEAN,
    is_approved BOOLEAN,
    consent_verified BOOLEAN,
    consent_verified_at TIMESTAMP WITH TIME ZONE,
    consent_method TEXT,
    marketing_consent BOOLEAN,
    marketing_consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    icon_storage TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.user_platform_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.address,
        p.city,
        p.state,
        p.postal_code,
        p.country,
        p.date_of_birth,
        p.preferred_language,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.notes,
        p.stripe_customer_id,
        p.is_active,
        p.is_approved,
        p.consent_verified,
        p.consent_verified_at,
        p.consent_method,
        p.marketing_consent,
        p.marketing_consent_date,
        p.created_at,
        p.updated_at,
        p.icon_storage
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to search user profiles (using existing table structure)
CREATE OR REPLACE FUNCTION public.search_user_profiles(
    search_term TEXT DEFAULT '',
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
    id BIGINT,
    user_id UUID,
    user_platform_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    date_of_birth DATE,
    preferred_language TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    stripe_customer_id TEXT,
    is_active BOOLEAN,
    is_approved BOOLEAN,
    consent_verified BOOLEAN,
    consent_verified_at TIMESTAMP WITH TIME ZONE,
    consent_method TEXT,
    marketing_consent BOOLEAN,
    marketing_consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    icon_storage TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.user_platform_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.address,
        p.city,
        p.state,
        p.postal_code,
        p.country,
        p.date_of_birth,
        p.preferred_language,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.notes,
        p.stripe_customer_id,
        p.is_active,
        p.is_approved,
        p.consent_verified,
        p.consent_verified_at,
        p.consent_method,
        p.marketing_consent,
        p.marketing_consent_date,
        p.created_at,
        p.updated_at,
        p.icon_storage
    FROM public.profiles p
    WHERE 
        (search_term = '' OR 
         p.first_name ILIKE '%' || search_term || '%' OR
         p.last_name ILIKE '%' || search_term || '%' OR
         p.email ILIKE '%' || search_term || '%' OR
         p.user_platform_id ILIKE '%' || search_term || '%')
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user profile (using existing table structure)
CREATE OR REPLACE FUNCTION public.update_user_profile(
    profile_updates JSONB
)
RETURNS TABLE(
    id BIGINT,
    user_id UUID,
    user_platform_id TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    date_of_birth DATE,
    preferred_language TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    stripe_customer_id TEXT,
    is_active BOOLEAN,
    is_approved BOOLEAN,
    consent_verified BOOLEAN,
    consent_verified_at TIMESTAMP WITH TIME ZONE,
    consent_method TEXT,
    marketing_consent BOOLEAN,
    marketing_consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    icon_storage TEXT
) AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        first_name = COALESCE(profile_updates->>'first_name', first_name),
        last_name = COALESCE(profile_updates->>'last_name', last_name),
        phone = COALESCE(profile_updates->>'phone', phone),
        address = COALESCE(profile_updates->>'address', address),
        city = COALESCE(profile_updates->>'city', city),
        state = COALESCE(profile_updates->>'state', state),
        postal_code = COALESCE(profile_updates->>'postal_code', postal_code),
        country = COALESCE(profile_updates->>'country', country),
        preferred_language = COALESCE(profile_updates->>'preferred_language', preferred_language),
        emergency_contact_name = COALESCE(profile_updates->>'emergency_contact_name', emergency_contact_name),
        emergency_contact_phone = COALESCE(profile_updates->>'emergency_contact_phone', emergency_contact_phone),
        notes = COALESCE(profile_updates->>'notes', notes),
        updated_at = NOW()
    WHERE profiles.user_id = auth.uid();

    RETURN QUERY
    SELECT 
        p.id,
        p.user_id,
        p.user_platform_id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.address,
        p.city,
        p.state,
        p.postal_code,
        p.country,
        p.date_of_birth,
        p.preferred_language,
        p.emergency_contact_name,
        p.emergency_contact_phone,
        p.notes,
        p.stripe_customer_id,
        p.is_active,
        p.is_approved,
        p.consent_verified,
        p.consent_verified_at,
        p.consent_method,
        p.marketing_consent,
        p.marketing_consent_date,
        p.created_at,
        p.updated_at,
        p.icon_storage
    FROM public.profiles p
    WHERE p.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions only
GRANT EXECUTE ON FUNCTION public.search_user_profiles TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_profile TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_user_profile TO authenticated, anon;