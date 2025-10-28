-- Update CRUD function to support owner and manager fields

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
    -- New owner fields
    p_owner_first_name TEXT DEFAULT NULL,
    p_owner_last_name TEXT DEFAULT NULL,
    p_owner_email TEXT DEFAULT NULL,
    p_owner_user_id UUID DEFAULT NULL,
    -- Enhanced manager fields
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
        IF p_entity_name IS NULL OR p_entity_type IS NULL OR p_organization_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'entity_name, entity_type, and organization_id are required');
        END IF;

        -- Validate is_active value
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        INSERT INTO global.entity_master_l01 (
            entity_id, entity_name, display_name, entity_type, organization_id, 
            is_active, description, billing_email, vat_gst_number, address,
            city, state, postal_code, country, phone, email, website,
            contact_person, assigned_manager_id, assigned_manager_contact,
            currency, language, emergency_contact_number, notes, accent_color,
            entity_platform_id
        ) VALUES (
            new_entity_id,
            p_entity_name,
            COALESCE(p_display_name, p_entity_name),
            p_entity_type,
            p_organization_id,
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
            p_assigned_manager_contact,
            p_currency,
            p_language,
            p_emergency_contact_number,
            p_notes,
            p_accent_color,
            'C01' || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000000)::TEXT, 6, '0')
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
        ELSE
            SELECT json_agg(row_to_json(e)) INTO result_data
            FROM (SELECT * FROM global.entity_master_l01 ORDER BY created_at DESC LIMIT 10) e;
        END IF;

        RETURN json_build_object('success', true, 'data', COALESCE(result_data, '[]'::json));

    ELSIF operation = 'UPDATE' THEN
        IF p_entity_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID is required for UPDATE');
        END IF;

        -- Validate is_active value
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        -- Update only provided fields
        UPDATE global.entity_master_l01 SET
            entity_name = COALESCE(p_entity_name, entity_name),
            display_name = COALESCE(p_display_name, display_name),
            entity_type = COALESCE(p_entity_type, entity_type),
            organization_id = COALESCE(p_organization_id, organization_id),
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
            assigned_manager_contact = COALESCE(p_assigned_manager_contact, assigned_manager_contact),
            currency = COALESCE(p_currency, currency),
            language = COALESCE(p_language, language),
            emergency_contact_number = COALESCE(p_emergency_contact_number, emergency_contact_number),
            notes = COALESCE(p_notes, notes),
            accent_color = COALESCE(p_accent_color, accent_color),
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

        IF NOT FOUND THEN
            RETURN json_build_object('success', false, 'message', 'Entity not found');
        END IF;

        SELECT row_to_json(e) INTO result_data
        FROM (SELECT * FROM global.entity_master_l01 WHERE entity_id = p_entity_id) e;

        RETURN json_build_object('success', true, 'data', result_data);

    ELSIF operation = 'DELETE' THEN
        IF p_entity_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID is required for DELETE');  
        END IF;

        -- Check for dependencies before delete
        IF EXISTS (SELECT 1 FROM global.employee_role_assignments WHERE entity_platform_id = (
            SELECT entity_platform_id FROM global.entity_master_l01 WHERE entity_id = p_entity_id
        )) THEN
            RETURN json_build_object('success', false, 'message', 'Cannot delete entity: has dependent employee role assignments');
        END IF;

        -- Delete ownership records
        DELETE FROM global.entity_ownership WHERE entity_id = p_entity_id;

        DELETE FROM global.entity_master_l01 WHERE entity_id = p_entity_id;

        IF NOT FOUND THEN
            RETURN json_build_object('success', false, 'message', 'Entity not found');
        END IF;

        RETURN json_build_object('success', true, 'message', 'Entity deleted successfully');

    ELSE
        RETURN json_build_object('success', false, 'message', 'Invalid operation. Use CREATE, READ, UPDATE, or DELETE');
    END IF;
END;
$$;

-- Create entity ownership table if it doesn't exist
CREATE TABLE IF NOT EXISTS global.entity_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES global.entity_master_l01(entity_id) ON DELETE CASCADE,
    owner_user_id UUID NOT NULL,
    owner_type TEXT DEFAULT 'primary' CHECK (owner_type IN ('primary', 'secondary', 'stakeholder')),
    ownership_percentage DECIMAL(5,2) DEFAULT 100.0 CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
    is_primary_owner BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, owner_user_id)
);

-- Enable RLS on ownership table
ALTER TABLE global.entity_ownership ENABLE ROW LEVEL SECURITY;

-- Create policies for ownership table
CREATE POLICY "Users can view entity ownership" ON global.entity_ownership
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "Users can manage entity ownership" ON global.entity_ownership  
    FOR ALL TO authenticated, anon
    USING (true);

GRANT ALL ON global.entity_ownership TO service_role, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;