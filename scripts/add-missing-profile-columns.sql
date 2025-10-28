-- Add missing columns to public.profiles table
-- emergency_contact_name, emergency_contact_phone, notes,
-- marketing_consent, consent_verified, preferred_language, stripe_customer_id

-- Check if columns exist before adding them
DO $$ 
BEGIN
    -- Add emergency_contact_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'emergency_contact_name'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN emergency_contact_name TEXT;
        
        COMMENT ON COLUMN public.profiles.emergency_contact_name IS 
        'Name of emergency contact person';
    END IF;

    -- Add emergency_contact_phone if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'emergency_contact_phone'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN emergency_contact_phone TEXT;
        
        COMMENT ON COLUMN public.profiles.emergency_contact_phone IS 
        'Phone number of emergency contact in international format (e.g., +1 555-123-4567)';
    END IF;

    -- Add notes if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN notes TEXT;
        
        COMMENT ON COLUMN public.profiles.notes IS 
        'Additional notes or comments about the user profile';
    END IF;

    -- Add marketing_consent if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'marketing_consent'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN marketing_consent BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN public.profiles.marketing_consent IS 
        'Whether user has consented to marketing communications';
    END IF;

    -- Add marketing_consent_date if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'marketing_consent_date'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN marketing_consent_date TIMESTAMPTZ;
        
        COMMENT ON COLUMN public.profiles.marketing_consent_date IS 
        'Date when marketing consent was granted';
    END IF;

    -- Add consent_verified if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'consent_verified'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN consent_verified BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN public.profiles.consent_verified IS 
        'Whether user consent has been verified';
    END IF;

    -- Add consent_verified_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'consent_verified_at'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN consent_verified_at TIMESTAMPTZ;
        
        COMMENT ON COLUMN public.profiles.consent_verified_at IS 
        'Timestamp when consent was verified';
    END IF;

    -- Add consent_method if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'consent_method'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN consent_method TEXT;
        
        COMMENT ON COLUMN public.profiles.consent_method IS 
        'Method used to obtain consent (email, UI, phone, etc.)';
    END IF;

    -- Add preferred_language if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'preferred_language'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN preferred_language TEXT DEFAULT 'en';
        
        COMMENT ON COLUMN public.profiles.preferred_language IS 
        'User preferred language (ISO 639-1 code)';
    END IF;

    -- Add stripe_customer_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN stripe_customer_id TEXT UNIQUE;
        
        COMMENT ON COLUMN public.profiles.stripe_customer_id IS 
        'Stripe customer identifier for billing integration';
    END IF;
END $$;

-- Create or replace function to validate international phone numbers
CREATE OR REPLACE FUNCTION public.validate_phone_number(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    cleaned_number TEXT;
    digit_count INTEGER;
BEGIN
    -- Return true if phone number is null or empty
    IF phone_number IS NULL OR phone_number = '' THEN
        RETURN TRUE;
    END IF;
    
    -- Remove all non-digit characters except the leading +
    cleaned_number := regexp_replace(phone_number, '[^0-9+]', '', 'g');
    
    -- Ensure it starts with +
    IF NOT (cleaned_number LIKE '+%') THEN
        RETURN FALSE;
    END IF;
    
    -- Remove the + and count digits
    digit_count := length(regexp_replace(cleaned_number, '[^0-9]', '', 'g'));
    
    -- International phone numbers should have between 7 and 15 digits
    -- (per E.164 standard)
    -- Common lengths:
    -- - US/Canada: 11 digits (country code 1 + 10 digits)
    -- - UK: 11-13 digits (country code 44 + 10-12 digits)
    -- - India: 12 digits (country code 91 + 10 digits)
    -- - China: 13 digits (country code 86 + 11 digits)
    -- - Germany: 11-13 digits (country code 49 + 10-12 digits)
    
    IF digit_count < 7 OR digit_count > 15 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.validate_phone_number IS 
'Validates international phone numbers according to E.164 standard. 
Accepts 7-15 digits with country code prefix (+).
Examples: +1 555-123-4567 (US), +44 20 7123 4567 (UK), +91 98765 43210 (India)';

-- Add check constraints for phone number validation
DO $$
BEGIN
    -- Add constraint for phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'profiles_phone_format_check'
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_phone_format_check 
        CHECK (public.validate_phone_number(phone));
    END IF;

    -- Add constraint for emergency_contact_phone if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'profiles_emergency_phone_format_check'
        AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_emergency_phone_format_check 
        CHECK (public.validate_phone_number(emergency_contact_phone));
    END IF;
END $$;

-- Create index for better query performance on emergency contacts
CREATE INDEX IF NOT EXISTS idx_profiles_emergency_contact 
ON public.profiles(emergency_contact_name, emergency_contact_phone) 
WHERE emergency_contact_name IS NOT NULL OR emergency_contact_phone IS NOT NULL;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Successfully added missing columns to public.profiles';
    RAISE NOTICE '   Emergency Contact:';
    RAISE NOTICE '   - emergency_contact_name (TEXT)';
    RAISE NOTICE '   - emergency_contact_phone (TEXT with validation)';
    RAISE NOTICE '   Consent & Preferences:';
    RAISE NOTICE '   - marketing_consent (BOOLEAN)';
    RAISE NOTICE '   - marketing_consent_date (TIMESTAMPTZ)';
    RAISE NOTICE '   - consent_verified (BOOLEAN)';
    RAISE NOTICE '   - consent_verified_at (TIMESTAMPTZ)';
    RAISE NOTICE '   - consent_method (TEXT)';
    RAISE NOTICE '   - preferred_language (TEXT, default: en)';
    RAISE NOTICE '   Billing:';
    RAISE NOTICE '   - stripe_customer_id (TEXT UNIQUE)';
    RAISE NOTICE '   Other:';
    RAISE NOTICE '   - notes (TEXT)';
    RAISE NOTICE '';
    RAISE NOTICE '📞 Phone validation function created: public.validate_phone_number()';
    RAISE NOTICE '   - Validates E.164 international format';
    RAISE NOTICE '   - Accepts 7-15 digits with + prefix';
    RAISE NOTICE '   - Applied to both phone and emergency_contact_phone columns';
END $$;
