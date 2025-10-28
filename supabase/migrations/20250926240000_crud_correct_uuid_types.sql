-- Fix UUID type mismatches in CRUD function

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

-- Create CRUD function with correct UUID parameter types
CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    -- Filtering parameters for READ operations
    filter_entity_type TEXT DEFAULT NULL,
    filter_is_active TEXT DEFAULT NULL,
    filter_organization_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    
    -- Entity parameters with correct types
    p_id UUID DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_platform_id TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_accent_color TEXT DEFAULT NULL,
    p_primary_color TEXT DEFAULT NULL,
    p_secondary_color TEXT DEFAULT NULL,
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
    p_assigned_manager_id UUID DEFAULT NULL,  -- Changed back to UUID
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
    p_created_by UUID DEFAULT NULL,  -- Changed to UUID
    p_updated_by UUID DEFAULT NULL,  -- Changed to UUID
    p_deleted_by UUID DEFAULT NULL,  -- Changed to UUID
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

            -- Update using CASE statements with correct types
            UPDATE global.entity_master_l01 SET
                entity_name = CASE WHEN p_entity_name IS NOT NULL THEN p_entity_name ELSE entity_name END,
                entity_type = CASE WHEN p_entity_type IS NOT NULL THEN p_entity_type ELSE entity_type END,
                entity_platform_id = CASE WHEN p_entity_platform_id IS NOT NULL THEN p_entity_platform_id ELSE entity_platform_id END,
                display_name = CASE WHEN p_display_name IS NOT NULL THEN p_display_name ELSE display_name END,
                description = CASE WHEN p_description IS NOT NULL THEN p_description ELSE description END,
                primary_color = CASE WHEN p_primary_color IS NOT NULL THEN p_primary_color ELSE primary_color END,
                secondary_color = CASE WHEN p_secondary_color IS NOT NULL THEN p_secondary_color ELSE secondary_color END,
                accent_color = CASE WHEN p_accent_color IS NOT NULL THEN p_accent_color ELSE accent_color END,
                brand_name = CASE WHEN p_brand_name IS NOT NULL THEN p_brand_name ELSE brand_name END,
                manager_name = CASE WHEN p_manager_name IS NOT NULL THEN p_manager_name ELSE manager_name END,
                address = CASE WHEN p_address IS NOT NULL THEN p_address ELSE address END,
                city = CASE WHEN p_city IS NOT NULL THEN p_city ELSE city END,
                state = CASE WHEN p_state IS NOT NULL THEN p_state ELSE state END,
                postal_code = CASE WHEN p_postal_code IS NOT NULL THEN p_postal_code ELSE postal_code END,
                country = CASE WHEN p_country IS NOT NULL THEN p_country ELSE country END,
                phone = CASE WHEN p_phone IS NOT NULL THEN p_phone ELSE phone END,
                email = CASE WHEN p_email IS NOT NULL THEN p_email ELSE email END,
                website = CASE WHEN p_website IS NOT NULL THEN p_website ELSE website END,
                contact_person = CASE WHEN p_contact_person IS NOT NULL THEN p_contact_person ELSE contact_person END,
                billing_email = CASE WHEN p_billing_email IS NOT NULL THEN p_billing_email ELSE billing_email END,
                assigned_manager_id = CASE WHEN p_assigned_manager_id IS NOT NULL THEN p_assigned_manager_id ELSE assigned_manager_id END,
                assigned_manager_contact = CASE WHEN p_assigned_manager_contact IS NOT NULL THEN p_assigned_manager_contact ELSE assigned_manager_contact END,
                currency = CASE WHEN p_currency IS NOT NULL THEN p_currency ELSE currency END,
                language = CASE WHEN p_language IS NOT NULL THEN p_language ELSE language END,
                vat_gst_number = CASE WHEN p_vat_gst_number IS NOT NULL THEN p_vat_gst_number ELSE vat_gst_number END,
                business_registration_number = CASE WHEN p_business_registration_number IS NOT NULL THEN p_business_registration_number ELSE business_registration_number END,
                incorporation_date = CASE WHEN p_incorporation_date IS NOT NULL THEN p_incorporation_date ELSE incorporation_date END,
                certificate_of_incorporation_url = CASE WHEN p_certificate_of_incorporation_url IS NOT NULL THEN p_certificate_of_incorporation_url ELSE certificate_of_incorporation_url END,
                emergency_contact_number = CASE WHEN p_emergency_contact_number IS NOT NULL THEN p_emergency_contact_number ELSE emergency_contact_number END,
                is_regulated = CASE WHEN p_is_regulated IS NOT NULL THEN p_is_regulated ELSE is_regulated END,
                accreditation_details = CASE WHEN p_accreditation_details IS NOT NULL THEN p_accreditation_details ELSE accreditation_details END,
                logo_storage = CASE WHEN p_logo_storage IS NOT NULL THEN p_logo_storage ELSE logo_storage END,
                notes = CASE WHEN p_notes IS NOT NULL THEN p_notes ELSE notes END,
                is_active = CASE WHEN p_is_active IS NOT NULL THEN p_is_active ELSE is_active END,
                organization_id = CASE WHEN p_organization_id IS NOT NULL THEN p_organization_id ELSE organization_id END,
                organization_platform_id = CASE WHEN p_organization_platform_id IS NOT NULL THEN p_organization_platform_id ELSE organization_platform_id END,
                created_by = CASE WHEN p_created_by IS NOT NULL THEN p_created_by ELSE created_by END,
                updated_by = CASE WHEN p_updated_by IS NOT NULL THEN p_updated_by ELSE updated_by END,
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

            INSERT INTO global.entity_master_l01 (
                entity_id, entity_name, entity_type, entity_platform_id,
                display_name, description, primary_color, secondary_color, 
                accent_color, brand_name, manager_name, address, city, state, 
                postal_code, country, phone, email, website, contact_person, 
                billing_email, assigned_manager_id, assigned_manager_contact, 
                currency, language, vat_gst_number, business_registration_number,
                incorporation_date, certificate_of_incorporation_url,
                emergency_contact_number, is_regulated, accreditation_details,
                logo_storage, notes, is_active, organization_id,
                organization_platform_id, created_by, updated_by
            ) VALUES (
                new_entity_id, p_entity_name, p_entity_type, p_entity_platform_id,
                p_display_name, p_description, p_primary_color, p_secondary_color,
                p_accent_color, p_brand_name, p_manager_name, p_address, p_city, 
                p_state, p_postal_code, p_country, p_phone, p_email, p_website, 
                p_contact_person, p_billing_email, p_assigned_manager_id, 
                p_assigned_manager_contact, p_currency, p_language, p_vat_gst_number, 
                p_business_registration_number, p_incorporation_date, 
                p_certificate_of_incorporation_url, p_emergency_contact_number, 
                p_is_regulated, p_accreditation_details, p_logo_storage, p_notes, 
                p_is_active, p_organization_id, p_organization_platform_id,
                p_created_by, p_updated_by
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

            UPDATE global.entity_master_l01 SET
                deleted_at = CASE WHEN p_deleted_at IS NOT NULL THEN p_deleted_at ELSE NOW() END,
                deleted_by = CASE WHEN p_deleted_by IS NOT NULL THEN p_deleted_by ELSE deleted_by END,
                deletion_reason = CASE WHEN p_deletion_reason IS NOT NULL THEN p_deletion_reason ELSE 'Deleted via CRUD function' END
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
COMMENT ON FUNCTION public.crud_entity_master_l01 IS 'CRUD function with correct UUID parameter types';