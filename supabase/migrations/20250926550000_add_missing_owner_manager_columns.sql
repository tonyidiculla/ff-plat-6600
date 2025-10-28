-- Add missing owner and manager email columns to entity_master_l01 table

-- Add owner email and user_id columns
ALTER TABLE global.entity_master_l01 
ADD COLUMN IF NOT EXISTS owner_email TEXT,
ADD COLUMN IF NOT EXISTS owner_user_id UUID;

-- Add manager email column
ALTER TABLE global.entity_master_l01 
ADD COLUMN IF NOT EXISTS manager_email TEXT;

-- Add foreign key constraint for owner_user_id to auth.users
ALTER TABLE global.entity_master_l01 
ADD CONSTRAINT fk_entity_owner_user 
FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for better performance on owner lookups
CREATE INDEX IF NOT EXISTS idx_entity_master_l01_owner_user_id 
ON global.entity_master_l01(owner_user_id);

-- Add index for owner email lookups
CREATE INDEX IF NOT EXISTS idx_entity_master_l01_owner_email 
ON global.entity_master_l01(owner_email);

-- Add index for manager email lookups  
CREATE INDEX IF NOT EXISTS idx_entity_master_l01_manager_email 
ON global.entity_master_l01(manager_email);

-- Update the CRUD function to handle the new columns in INSERT and UPDATE operations
DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_is_active TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_contact_person TEXT DEFAULT NULL,
    p_assigned_manager_id UUID DEFAULT NULL,
    p_assigned_manager_contact UUID DEFAULT NULL,
    p_currency TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_emergency_contact_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_accent_color TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    -- Owner fields
    p_owner_first_name TEXT DEFAULT NULL,
    p_owner_last_name TEXT DEFAULT NULL,
    p_owner_email TEXT DEFAULT NULL,
    p_owner_user_id UUID DEFAULT NULL,
    -- Manager fields
    p_manager_first_name TEXT DEFAULT NULL,
    p_manager_last_name TEXT DEFAULT NULL,
    p_manager_email TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
    entity_record RECORD;
    new_entity_id UUID;
BEGIN
    IF operation = 'CREATE' THEN
        -- Generate new entity_id if not provided
        IF p_entity_id IS NULL THEN
            new_entity_id := gen_random_uuid();
        ELSE
            new_entity_id := p_entity_id;
        END IF;

        -- Validate required fields
        IF p_entity_name IS NULL OR p_country IS NULL OR p_email IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'entity_name, country, and email are required');
        END IF;

        -- Validate is_active value
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        INSERT INTO global.entity_master_l01 (
            entity_id, entity_name, display_name, entity_type, organization_id, 
            is_active, description, billing_email, vat_gst_number, address,
            city, state, postal_code, country, phone, email, website,
            contact_person, assigned_manager_id, currency, language, 
            emergency_contact_number, notes, accent_color, entity_platform_id,
            owner_first_name, owner_last_name, owner_email, owner_user_id,
            manager_first_name, manager_last_name, manager_email
        ) VALUES (
            new_entity_id,
            p_entity_name,
            COALESCE(p_display_name, p_entity_name),
            COALESCE(p_entity_type, 'organization'),
            COALESCE(p_organization_id, new_entity_id), -- Self-reference for organizations
            COALESCE(p_is_active, 'active'),
            p_description,
            p_billing_email,
            p_vat_gst_number,
            p_address,
            p_city,
            p_state,
            p_postal_code,
            p_country,
            p_phone,
            p_email,
            p_website,
            p_contact_person,
            p_assigned_manager_id,
            p_currency,
            p_language,
            p_emergency_contact_number,
            p_notes,
            p_accent_color,
            'C01' || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000000)::TEXT, 6, '0'),
            p_owner_first_name,
            p_owner_last_name,
            p_owner_email,
            p_owner_user_id,
            p_manager_first_name,
            p_manager_last_name,
            p_manager_email
        );

        -- Create owner mapping if provided
        IF p_owner_user_id IS NOT NULL THEN
            INSERT INTO global.entity_ownership (
                entity_id,
                owner_user_id,
                owner_type,
                ownership_percentage,
                is_primary_owner,
                created_at
            ) VALUES (
                new_entity_id,
                p_owner_user_id,
                'primary',
                100.0,
                true,
                NOW()
            ) ON CONFLICT (entity_id, owner_user_id) DO UPDATE SET
                ownership_percentage = 100.0,
                is_primary_owner = true,
                updated_at = NOW();
        END IF;

        SELECT row_to_json(e) INTO result_data
        FROM (SELECT * FROM global.entity_master_l01 WHERE entity_id = new_entity_id) e;

        RETURN json_build_object('success', true, 'data', result_data);

    ELSIF operation = 'READ' THEN
        IF p_entity_id IS NOT NULL THEN
            SELECT row_to_json(e) INTO result_data
            FROM (SELECT * FROM global.entity_master_l01 WHERE entity_id = p_entity_id) e;
            
            IF result_data IS NULL THEN
                RETURN json_build_object('success', false, 'message', 'Entity not found');
            END IF;
            
            RETURN json_build_object('success', true, 'data', result_data);
        ELSE
            SELECT json_agg(row_to_json(e)) INTO result_data
            FROM (SELECT * FROM global.entity_master_l01 WHERE deleted_at IS NULL ORDER BY created_at DESC) e;

            RETURN json_build_object('success', true, 'data', COALESCE(result_data, '[]'::json));
        END IF;

    ELSIF operation = 'UPDATE' THEN
        IF p_entity_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID is required for UPDATE');
        END IF;

        -- Validate is_active value
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        UPDATE global.entity_master_l01
        SET
            entity_name = COALESCE(p_entity_name, entity_name),
            display_name = COALESCE(p_display_name, display_name),
            entity_type = COALESCE(p_entity_type, entity_type),
            is_active = COALESCE(p_is_active, is_active),
            description = COALESCE(p_description, description),
            billing_email = COALESCE(p_billing_email, billing_email),
            vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
            address = COALESCE(p_address, address),
            city = COALESCE(p_city, city),
            state = COALESCE(p_state, state),
            postal_code = COALESCE(p_postal_code, postal_code),
            country = COALESCE(p_country, country),
            phone = COALESCE(p_phone, phone),
            email = COALESCE(p_email, email),
            website = COALESCE(p_website, website),
            contact_person = COALESCE(p_contact_person, contact_person),
            assigned_manager_id = COALESCE(p_assigned_manager_id, assigned_manager_id),
            currency = COALESCE(p_currency, currency),
            language = COALESCE(p_language, language),
            emergency_contact_number = COALESCE(p_emergency_contact_number, emergency_contact_number),
            notes = COALESCE(p_notes, notes),
            accent_color = COALESCE(p_accent_color, accent_color),
            owner_first_name = COALESCE(p_owner_first_name, owner_first_name),
            owner_last_name = COALESCE(p_owner_last_name, owner_last_name),
            owner_email = COALESCE(p_owner_email, owner_email),
            owner_user_id = COALESCE(p_owner_user_id, owner_user_id),
            manager_first_name = COALESCE(p_manager_first_name, manager_first_name),
            manager_last_name = COALESCE(p_manager_last_name, manager_last_name),
            manager_email = COALESCE(p_manager_email, manager_email),
            updated_at = NOW()
        WHERE entity_id = p_entity_id;

        -- Update owner mapping if provided
        IF p_owner_user_id IS NOT NULL THEN
            INSERT INTO global.entity_ownership (
                entity_id,
                owner_user_id,
                owner_type,
                ownership_percentage,
                is_primary_owner,
                created_at
            ) VALUES (
                p_entity_id,
                p_owner_user_id,
                'primary',
                100.0,
                true,
                NOW()
            ) ON CONFLICT (entity_id, owner_user_id) DO UPDATE SET
                ownership_percentage = 100.0,
                is_primary_owner = true,
                updated_at = NOW();
        END IF;

        SELECT row_to_json(e) INTO result_data
        FROM (SELECT * FROM global.entity_master_l01 WHERE entity_id = p_entity_id) e;

        RETURN json_build_object('success', true, 'data', result_data);

    ELSIF operation = 'DELETE' THEN
        IF p_entity_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID is required for DELETE');
        END IF;

        -- Soft delete
        UPDATE global.entity_master_l01
        SET
            deleted_at = NOW(),
            deleted_by = NULL, -- Would need to get current user in real implementation
            deletion_reason = 'Soft deleted via CRUD operation'
        WHERE entity_id = p_entity_id;

        RETURN json_build_object('success', true, 'message', 'Entity soft deleted successfully');

    ELSE
        RETURN json_build_object('success', false, 'message', 'Invalid operation. Use CREATE, READ, UPDATE, or DELETE');
    END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO authenticated;
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;