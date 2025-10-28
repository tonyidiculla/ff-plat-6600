-- Create a simple working CRUD function using only known working fields from minimal test

DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    -- Filtering parameters for READ operations
    filter_entity_type TEXT DEFAULT NULL,
    filter_is_active TEXT DEFAULT NULL,
    filter_organization_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    
    -- Entity parameters - only fields that worked in minimal test
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL,
    
    -- Add more fields gradually
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_contact_person TEXT DEFAULT NULL,
    p_business_registration_number TEXT DEFAULT NULL,
    p_currency TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
    p_accent_color TEXT DEFAULT NULL,
    p_manager_name TEXT DEFAULT NULL,
    p_emergency_contact_number TEXT DEFAULT NULL,
    p_certificate_of_incorporation_url TEXT DEFAULT NULL,
    p_brand_name TEXT DEFAULT NULL,
    p_is_active TEXT DEFAULT NULL,
    p_organization_platform_id TEXT DEFAULT NULL,
    p_assigned_manager_contact TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_platform_id TEXT DEFAULT NULL
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
    -- Validate operation
    IF operation NOT IN ('CREATE', 'READ', 'UPDATE', 'DELETE') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid operation. Must be CREATE, READ, UPDATE, or DELETE.'
        );
    END IF;

    CASE operation
        WHEN 'READ' THEN
            IF p_entity_id IS NOT NULL THEN
                SELECT * INTO entity_record 
                FROM global.entity_master_l01 
                WHERE entity_id = p_entity_id;
                
                IF FOUND THEN
                    RETURN json_build_object(
                        'success', true,
                        'data', json_build_array(row_to_json(entity_record))
                    );
                ELSE
                    RETURN json_build_object(
                        'success', false,
                        'message', 'Entity not found'
                    );
                END IF;
            ELSE
                SELECT json_agg(row_to_json(entities)) INTO result_data
                FROM (
                    SELECT * FROM global.entity_master_l01
                    WHERE (filter_entity_type IS NULL OR entity_type = filter_entity_type)
                      AND (filter_is_active IS NULL OR is_active = filter_is_active)
                      AND (filter_organization_id IS NULL OR organization_id = filter_organization_id)
                    ORDER BY created_at DESC
                    LIMIT limit_count OFFSET offset_count
                ) entities;

                RETURN json_build_object(
                    'success', true,
                    'data', COALESCE(result_data, '[]'::json)
                );
            END IF;

        WHEN 'UPDATE' THEN
            IF p_entity_id IS NULL THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Entity ID is required for UPDATE operation'
                );
            END IF;

            -- Copy the exact working pattern from minimal function
            UPDATE global.entity_master_l01 SET
                entity_name = COALESCE(p_entity_name, entity_name),
                display_name = COALESCE(p_display_name, display_name),
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
                business_registration_number = COALESCE(p_business_registration_number, business_registration_number),
                currency = COALESCE(p_currency, currency),
                language = COALESCE(p_language, language),
                notes = COALESCE(p_notes, notes),
                primary_color = COALESCE(p_primary_color, primary_color),
                secondary_color = COALESCE(p_secondary_color, secondary_color),
                accent_color = COALESCE(p_accent_color, accent_color),
                manager_name = COALESCE(p_manager_name, manager_name),
                emergency_contact_number = COALESCE(p_emergency_contact_number, emergency_contact_number),
                certificate_of_incorporation_url = COALESCE(p_certificate_of_incorporation_url, certificate_of_incorporation_url),
                brand_name = COALESCE(p_brand_name, brand_name),
                is_active = COALESCE(p_is_active, is_active),
                organization_platform_id = COALESCE(p_organization_platform_id, organization_platform_id),
                assigned_manager_contact = COALESCE(p_assigned_manager_contact, assigned_manager_contact),
                entity_type = COALESCE(p_entity_type, entity_type),
                entity_platform_id = COALESCE(p_entity_platform_id, entity_platform_id),
                updated_at = NOW()
            WHERE entity_id = p_entity_id
            RETURNING * INTO entity_record;

            IF FOUND THEN
                RETURN json_build_object(
                    'success', true,
                    'message', 'Entity updated successfully',
                    'data', row_to_json(entity_record)
                );
            ELSE
                RETURN json_build_object(
                    'success', false,
                    'message', 'Entity not found'
                );
            END IF;

        WHEN 'CREATE' THEN
            RETURN json_build_object(
                'success', false,
                'message', 'CREATE operation not implemented yet'
            );

        WHEN 'DELETE' THEN
            RETURN json_build_object(
                'success', false,
                'message', 'DELETE operation not implemented yet'
            );
    END CASE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO authenticated;

-- Comment
COMMENT ON FUNCTION public.crud_entity_master_l01 IS 'Text-only CRUD function based on working minimal version';