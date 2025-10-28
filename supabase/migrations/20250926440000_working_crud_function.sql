-- Create a working CRUD function that respects all constraints

DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_entity_description TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_is_active TEXT DEFAULT NULL, -- Use TEXT with valid status values
    p_address_line_1 TEXT DEFAULT NULL,
    p_address_line_2 TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_phone_number TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_registration_number TEXT DEFAULT NULL,
    p_license_number TEXT DEFAULT NULL,
    p_tax_id TEXT DEFAULT NULL,
    p_established_date DATE DEFAULT NULL,
    p_subscription_type TEXT DEFAULT NULL,
    p_subscription_status TEXT DEFAULT NULL,
    p_billing_address JSONB DEFAULT NULL,
    p_contact_info JSONB DEFAULT NULL,
    p_business_settings JSONB DEFAULT NULL,
    p_assigned_manager_id UUID DEFAULT NULL,
    p_assigned_manager_contact UUID DEFAULT NULL
    -- Note: entity_platform_id is not updatable due to foreign key constraints
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

        -- Validate required fields for CREATE
        IF p_entity_name IS NULL OR p_entity_type IS NULL OR p_organization_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'entity_name, entity_type, and organization_id are required for CREATE');
        END IF;

        -- Validate is_active value if provided
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        -- Generate entity_platform_id (assuming a format like C01000XXX)
        INSERT INTO global.entity_master_l01 (
            entity_id, entity_name, display_name, entity_description, billing_email, 
            vat_gst_number, entity_type, organization_id, is_active,
            address_line_1, address_line_2, city, state, postal_code, country,
            phone_number, email, website, registration_number, license_number,
            tax_id, established_date, subscription_type, subscription_status,
            billing_address, contact_info, business_settings,
            assigned_manager_id, assigned_manager_contact,
            entity_platform_id
        ) VALUES (
            new_entity_id,
            p_entity_name,
            COALESCE(p_display_name, p_entity_name),
            p_entity_description,
            p_billing_email,
            p_vat_gst_number,
            p_entity_type,
            p_organization_id,
            COALESCE(p_is_active, 'active'),
            p_address_line_1,
            p_address_line_2,  
            p_city,
            p_state,
            p_postal_code,
            p_country,
            p_phone_number,
            p_email,
            p_website,
            p_registration_number,
            p_license_number,
            p_tax_id,
            p_established_date,
            p_subscription_type,
            p_subscription_status,
            p_billing_address,
            p_contact_info,
            p_business_settings,
            p_assigned_manager_id,
            p_assigned_manager_contact,
            'C01' || LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000000)::TEXT, 6, '0')
        );

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

        -- Validate is_active value if provided
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        -- Update only the fields that are provided (not NULL)
        UPDATE global.entity_master_l01 SET
            entity_name = COALESCE(p_entity_name, entity_name),
            display_name = COALESCE(p_display_name, display_name),
            entity_description = COALESCE(p_entity_description, entity_description),
            billing_email = COALESCE(p_billing_email, billing_email),
            vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
            entity_type = COALESCE(p_entity_type, entity_type),
            organization_id = COALESCE(p_organization_id, organization_id),
            is_active = COALESCE(p_is_active, is_active),
            address_line_1 = COALESCE(p_address_line_1, address_line_1),
            address_line_2 = COALESCE(p_address_line_2, address_line_2),
            city = COALESCE(p_city, city),
            state = COALESCE(p_state, state),
            postal_code = COALESCE(p_postal_code, postal_code),
            country = COALESCE(p_country, country),
            phone_number = COALESCE(p_phone_number, phone_number),
            email = COALESCE(p_email, email),
            website = COALESCE(p_website, website),
            registration_number = COALESCE(p_registration_number, registration_number),
            license_number = COALESCE(p_license_number, license_number),
            tax_id = COALESCE(p_tax_id, tax_id),
            established_date = COALESCE(p_established_date, established_date),
            subscription_type = COALESCE(p_subscription_type, subscription_type),
            subscription_status = COALESCE(p_subscription_status, subscription_status),
            billing_address = COALESCE(p_billing_address, billing_address),
            contact_info = COALESCE(p_contact_info, contact_info),
            business_settings = COALESCE(p_business_settings, business_settings),
            assigned_manager_id = COALESCE(p_assigned_manager_id, assigned_manager_id),
            assigned_manager_contact = COALESCE(p_assigned_manager_contact, assigned_manager_contact),
            updated_at = NOW()
        WHERE entity_id = p_entity_id;

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

GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;