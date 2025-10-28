-- Fix the table name in the CRUD function - it should be global.entity_master_l01

-- Drop the function with wrong table name
DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

-- Create new comprehensive CRUD function for global.entity_master_l01
CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    -- Filtering parameters for READ operations
    filter_entity_type TEXT DEFAULT NULL,
    filter_is_active TEXT DEFAULT NULL,
    filter_organization_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    
    -- All entity_master_l01 table columns as parameters
    p_id UUID DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_platform_id TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_admin_user_id UUID DEFAULT NULL,
    p_logo_url TEXT DEFAULT NULL,
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
    p_accent_color TEXT DEFAULT NULL,
    p_brand_name TEXT DEFAULT NULL,
    p_manager_name TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_postal_code TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_website TEXT DEFAULT NULL,
    p_contact_person TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_assigned_manager_id UUID DEFAULT NULL,
    p_assigned_manager_contact TEXT DEFAULT NULL,
    p_currency TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL,
    p_business_registration_number TEXT DEFAULT NULL,
    p_incorporation_date DATE DEFAULT NULL,
    p_certificate_of_incorporation_url TEXT DEFAULT NULL,
    p_emergency_contact_number TEXT DEFAULT NULL,
    p_is_regulated BOOLEAN DEFAULT NULL,
    p_accreditation_details JSONB DEFAULT NULL,
    p_logo_storage JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_is_active TEXT DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_organization_platform_id TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_updated_by UUID DEFAULT NULL,
    p_deleted_by UUID DEFAULT NULL,
    p_deleted_at TIMESTAMPTZ DEFAULT NULL,
    p_deletion_reason TEXT DEFAULT NULL
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
        WHEN 'CREATE' THEN
            -- Generate new entity_id if not provided
            IF p_entity_id IS NULL THEN
                new_entity_id := gen_random_uuid();
            ELSE
                new_entity_id := p_entity_id;
            END IF;

            -- Insert new entity
            INSERT INTO global.entity_master_l01 (
                entity_id, entity_name, entity_type, entity_platform_id,
                display_name, description, admin_user_id, logo_url,
                primary_color, secondary_color, accent_color, brand_name,
                manager_name, address, city, state, postal_code, country,
                phone, email, website, contact_person, billing_email,
                assigned_manager_id, assigned_manager_contact, currency,
                language, vat_gst_number, business_registration_number,
                incorporation_date, certificate_of_incorporation_url,
                emergency_contact_number, is_regulated, accreditation_details,
                logo_storage, notes, is_active, organization_id,
                organization_platform_id, created_by, updated_by
            ) VALUES (
                new_entity_id, p_entity_name, p_entity_type, p_entity_platform_id,
                p_display_name, p_description, p_admin_user_id, p_logo_url,
                p_primary_color, p_secondary_color, p_accent_color, p_brand_name,
                p_manager_name, p_address, p_city, p_state, p_postal_code, p_country,
                p_phone, p_email, p_website, p_contact_person, p_billing_email,
                p_assigned_manager_id, p_assigned_manager_contact, p_currency,
                p_language, p_vat_gst_number, p_business_registration_number,
                p_incorporation_date, p_certificate_of_incorporation_url,
                p_emergency_contact_number, p_is_regulated, p_accreditation_details,
                p_logo_storage, p_notes, p_is_active, p_organization_id,
                p_organization_platform_id, p_created_by, p_updated_by
            ) RETURNING * INTO entity_record;

            RETURN json_build_object(
                'success', true,
                'message', 'Entity created successfully',
                'data', row_to_json(entity_record)
            );

        WHEN 'READ' THEN
            -- Build dynamic query for reading entities
            IF p_entity_id IS NOT NULL THEN
                -- Get specific entity
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
                -- Get entities with filters
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
            -- Validate entity_id is provided
            IF p_entity_id IS NULL THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Entity ID is required for UPDATE operation'
                );
            END IF;

            -- Update entity with all possible fields
            UPDATE global.entity_master_l01 SET
                entity_name = COALESCE(p_entity_name, entity_name),
                entity_type = COALESCE(p_entity_type, entity_type),
                entity_platform_id = COALESCE(p_entity_platform_id, entity_platform_id),
                display_name = COALESCE(p_display_name, display_name),
                description = COALESCE(p_description, description),
                admin_user_id = COALESCE(p_admin_user_id, admin_user_id),
                logo_url = COALESCE(p_logo_url, logo_url),
                primary_color = COALESCE(p_primary_color, primary_color),
                secondary_color = COALESCE(p_secondary_color, secondary_color),
                accent_color = COALESCE(p_accent_color, accent_color),
                brand_name = COALESCE(p_brand_name, brand_name),
                manager_name = COALESCE(p_manager_name, manager_name),
                address = COALESCE(p_address, address),
                city = COALESCE(p_city, city),
                state = COALESCE(p_state, state),
                postal_code = COALESCE(p_postal_code, postal_code),
                country = COALESCE(p_country, country),
                phone = COALESCE(p_phone, phone),
                email = COALESCE(p_email, email),
                website = COALESCE(p_website, website),
                contact_person = COALESCE(p_contact_person, contact_person),
                billing_email = COALESCE(p_billing_email, billing_email),
                assigned_manager_id = COALESCE(p_assigned_manager_id, assigned_manager_id),
                assigned_manager_contact = COALESCE(p_assigned_manager_contact, assigned_manager_contact),
                currency = COALESCE(p_currency, currency),
                language = COALESCE(p_language, language),
                vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
                business_registration_number = COALESCE(p_business_registration_number, business_registration_number),
                incorporation_date = COALESCE(p_incorporation_date, incorporation_date),
                certificate_of_incorporation_url = COALESCE(p_certificate_of_incorporation_url, certificate_of_incorporation_url),
                emergency_contact_number = COALESCE(p_emergency_contact_number, emergency_contact_number),
                is_regulated = COALESCE(p_is_regulated, is_regulated),
                accreditation_details = COALESCE(p_accreditation_details, accreditation_details),
                logo_storage = COALESCE(p_logo_storage, logo_storage),
                notes = COALESCE(p_notes, notes),
                is_active = COALESCE(p_is_active, is_active),
                organization_id = COALESCE(p_organization_id, organization_id),
                organization_platform_id = COALESCE(p_organization_platform_id, organization_platform_id),
                updated_by = COALESCE(p_updated_by, updated_by),
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

        WHEN 'DELETE' THEN
            -- Validate entity_id is provided
            IF p_entity_id IS NULL THEN
                RETURN json_build_object(
                    'success', false,
                    'message', 'Entity ID is required for DELETE operation'
                );
            END IF;

            -- Soft delete (update deleted_at timestamp)
            UPDATE global.entity_master_l01 SET
                deleted_at = COALESCE(p_deleted_at, NOW()),
                deleted_by = COALESCE(p_deleted_by, p_updated_by),
                deletion_reason = COALESCE(p_deletion_reason, 'Deleted via CRUD function')
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.crud_entity_master_l01 IS 'Comprehensive CRUD function for global.entity_master_l01 table supporting all columns';