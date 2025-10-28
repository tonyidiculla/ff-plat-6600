-- Build comprehensive CRUD function systematically
-- Start with working fields and add others incrementally

DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    -- Filtering parameters for READ operations
    filter_entity_type TEXT DEFAULT NULL,
    filter_is_active TEXT DEFAULT NULL,
    filter_organization_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    
    -- Basic working fields (tested)
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    
    -- Add essential business fields incrementally
    p_billing_email TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    
    -- Contact and address fields
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_contact_person TEXT DEFAULT NULL,
    
    -- Business fields
    p_business_registration_number TEXT DEFAULT NULL,
    p_currency TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    
    -- Manager and organization fields
    p_manager_name TEXT DEFAULT NULL,
    p_organization_platform_id TEXT DEFAULT NULL,
    p_assigned_manager_contact TEXT DEFAULT NULL,
    
    -- Visual/branding fields
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
    p_accent_color TEXT DEFAULT NULL,
    p_brand_name TEXT DEFAULT NULL,
    
    -- Additional text fields
    p_entity_type TEXT DEFAULT NULL,
    p_entity_platform_id TEXT DEFAULT NULL,
    p_emergency_contact_number TEXT DEFAULT NULL,
    p_certificate_of_incorporation_url TEXT DEFAULT NULL,
    p_is_active TEXT DEFAULT NULL -- This is TEXT, not BOOLEAN based on actual data
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

            -- Update with only TEXT fields to avoid type mismatches
            UPDATE global.entity_master_l01 SET
                -- Core fields
                entity_name = COALESCE(p_entity_name, entity_name),
                billing_email = COALESCE(p_billing_email, billing_email),
                vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
                display_name = COALESCE(p_display_name, display_name),
                description = COALESCE(p_description, description),
                
                -- Contact and address fields
                address = COALESCE(p_address, address),
                city = COALESCE(p_city, city),
                state = COALESCE(p_state, state),
                postal_code = COALESCE(p_postal_code, postal_code),
                country = COALESCE(p_country, country),
                phone = COALESCE(p_phone, phone),
                email = COALESCE(p_email, email),
                website = COALESCE(p_website, website),
                contact_person = COALESCE(p_contact_person, contact_person),
                
                -- Business fields
                business_registration_number = COALESCE(p_business_registration_number, business_registration_number),
                currency = COALESCE(p_currency, currency),
                language = COALESCE(p_language, language),
                notes = COALESCE(p_notes, notes),
                
                -- Manager and organization fields
                manager_name = COALESCE(p_manager_name, manager_name),
                organization_platform_id = COALESCE(p_organization_platform_id, organization_platform_id),
                assigned_manager_contact = COALESCE(p_assigned_manager_contact, assigned_manager_contact),
                
                -- Visual/branding fields
                primary_color = COALESCE(p_primary_color, primary_color),
                secondary_color = COALESCE(p_secondary_color, secondary_color),
                accent_color = COALESCE(p_accent_color, accent_color),
                brand_name = COALESCE(p_brand_name, brand_name),
                
                -- Additional fields
                entity_type = COALESCE(p_entity_type, entity_type),
                entity_platform_id = COALESCE(p_entity_platform_id, entity_platform_id),
                emergency_contact_number = COALESCE(p_emergency_contact_number, emergency_contact_number),
                certificate_of_incorporation_url = COALESCE(p_certificate_of_incorporation_url, certificate_of_incorporation_url),
                is_active = COALESCE(p_is_active, is_active),
                
                -- Always update timestamp
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
            -- Generate new entity_id if not provided
            IF p_entity_id IS NULL THEN
                new_entity_id := gen_random_uuid();
            ELSE
                new_entity_id := p_entity_id;
            END IF;

            -- For CREATE, provide reasonable defaults for required fields
            INSERT INTO global.entity_master_l01 (
                entity_id, entity_name, entity_type, entity_platform_id,
                display_name, description, primary_color, secondary_color, 
                accent_color, brand_name, manager_name, address, city, state, 
                postal_code, country, phone, email, website, contact_person, 
                billing_email, assigned_manager_contact, 
                currency, language, vat_gst_number, business_registration_number,
                certificate_of_incorporation_url,
                emergency_contact_number, 
                notes, is_active, organization_platform_id
            ) VALUES (
                new_entity_id, 
                COALESCE(p_entity_name, 'New Entity'),
                COALESCE(p_entity_type, 'organization'),
                COALESCE(p_entity_platform_id, 'AUTO_' || substring(new_entity_id::text, 1, 8)),
                p_display_name, p_description, p_primary_color, p_secondary_color,
                p_accent_color, p_brand_name, p_manager_name, p_address, p_city, 
                p_state, p_postal_code, p_country, p_phone, p_email, p_website, 
                p_contact_person, p_billing_email, p_assigned_manager_contact,
                p_currency, p_language, p_vat_gst_number, p_business_registration_number,
                p_certificate_of_incorporation_url, p_emergency_contact_number,
                p_notes, COALESCE(p_is_active, 'active'), p_organization_platform_id
            ) RETURNING * INTO entity_record;

            RETURN json_build_object(
                'success', true,
                'message', 'Entity created successfully',
                'data', row_to_json(entity_record)
            );

        WHEN 'DELETE' THEN
            IF p_entity_id IS NULL THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Entity ID is required for DELETE operation'
                );
            END IF;

            -- Soft delete by setting deleted_at
            UPDATE global.entity_master_l01 SET
                deleted_at = NOW(),
                deletion_reason = 'Deleted via CRUD function'
            WHERE entity_id = p_entity_id
            RETURNING * INTO entity_record;

            IF FOUND THEN
                RETURN json_build_object(
                    'success', true,
                    'message', 'Entity deleted successfully',
                    'data', row_to_json(entity_record)
                );
            ELSE
                RETURN json_build_object(
                    'success', false,
                    'message', 'Entity not found'
                );
            END IF;
    END CASE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO authenticated;

-- Comment
COMMENT ON FUNCTION public.crud_entity_master_l01 IS 'Comprehensive CRUD function for entity_master_l01 with TEXT fields only (Phase 1)';