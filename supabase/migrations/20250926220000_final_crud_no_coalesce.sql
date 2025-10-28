-- Final comprehensive CRUD function without COALESCE type issues

-- Drop the simplified function
DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

-- Create the complete CRUD function with proper UPDATE logic (no COALESCE)
CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    -- Filtering parameters for READ operations
    filter_entity_type TEXT DEFAULT NULL,
    filter_is_active TEXT DEFAULT NULL,
    filter_organization_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    
    -- Entity parameters
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
    p_assigned_manager_id TEXT DEFAULT NULL,
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
    p_created_by TEXT DEFAULT NULL,
    p_updated_by TEXT DEFAULT NULL,
    p_deleted_by TEXT DEFAULT NULL,
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
    assigned_manager_uuid UUID;
    created_by_uuid UUID;
    updated_by_uuid UUID;
    deleted_by_uuid UUID;
    update_sql TEXT;
    update_values TEXT[];
    where_clause TEXT;
BEGIN
    -- Validate operation
    IF operation NOT IN ('CREATE', 'READ', 'UPDATE', 'DELETE') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid operation. Must be CREATE, READ, UPDATE, or DELETE.'
        );
    END IF;

    -- Convert text UUIDs to proper UUIDs where needed
    BEGIN
        assigned_manager_uuid := CASE 
            WHEN p_assigned_manager_id IS NULL OR p_assigned_manager_id = '' THEN NULL
            ELSE p_assigned_manager_id::UUID
        END;
    EXCEPTION WHEN invalid_text_representation THEN
        assigned_manager_uuid := NULL;
    END;

    BEGIN
        created_by_uuid := CASE 
            WHEN p_created_by IS NULL OR p_created_by = '' THEN NULL
            ELSE p_created_by::UUID
        END;
    EXCEPTION WHEN invalid_text_representation THEN
        created_by_uuid := NULL;
    END;

    BEGIN
        updated_by_uuid := CASE 
            WHEN p_updated_by IS NULL OR p_updated_by = '' THEN NULL
            ELSE p_updated_by::UUID
        END;
    EXCEPTION WHEN invalid_text_representation THEN
        updated_by_uuid := NULL;
    END;

    CASE operation
        WHEN 'READ' THEN
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

            -- Build dynamic UPDATE statement without COALESCE
            update_sql := 'UPDATE global.entity_master_l01 SET updated_at = NOW()';
            
            -- Add each field only if it's provided
            IF p_entity_name IS NOT NULL THEN
                update_sql := update_sql || ', entity_name = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_entity_name);
            END IF;
            
            IF p_entity_type IS NOT NULL THEN
                update_sql := update_sql || ', entity_type = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_entity_type);
            END IF;
            
            IF p_display_name IS NOT NULL THEN
                update_sql := update_sql || ', display_name = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_display_name);
            END IF;
            
            IF p_description IS NOT NULL THEN
                update_sql := update_sql || ', description = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_description);
            END IF;
            
            IF p_address IS NOT NULL THEN
                update_sql := update_sql || ', address = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_address);
            END IF;
            
            IF p_city IS NOT NULL THEN
                update_sql := update_sql || ', city = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_city);
            END IF;
            
            IF p_state IS NOT NULL THEN
                update_sql := update_sql || ', state = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_state);
            END IF;
            
            IF p_postal_code IS NOT NULL THEN
                update_sql := update_sql || ', postal_code = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_postal_code);
            END IF;
            
            IF p_country IS NOT NULL THEN
                update_sql := update_sql || ', country = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_country);
            END IF;
            
            IF p_phone IS NOT NULL THEN
                update_sql := update_sql || ', phone = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_phone);
            END IF;
            
            IF p_email IS NOT NULL THEN
                update_sql := update_sql || ', email = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_email);
            END IF;
            
            IF p_website IS NOT NULL THEN
                update_sql := update_sql || ', website = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_website);
            END IF;
            
            IF p_contact_person IS NOT NULL THEN
                update_sql := update_sql || ', contact_person = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_contact_person);
            END IF;
            
            IF p_billing_email IS NOT NULL THEN
                update_sql := update_sql || ', billing_email = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_billing_email);
            END IF;
            
            IF assigned_manager_uuid IS NOT NULL THEN
                update_sql := update_sql || ', assigned_manager_id = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, assigned_manager_uuid::TEXT);
            END IF;
            
            IF p_assigned_manager_contact IS NOT NULL THEN
                update_sql := update_sql || ', assigned_manager_contact = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_assigned_manager_contact);
            END IF;
            
            IF p_currency IS NOT NULL THEN
                update_sql := update_sql || ', currency = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_currency);
            END IF;
            
            IF p_language IS NOT NULL THEN
                update_sql := update_sql || ', language = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_language);
            END IF;
            
            IF p_vat_gst_number IS NOT NULL THEN
                update_sql := update_sql || ', vat_gst_number = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_vat_gst_number);
            END IF;
            
            IF p_emergency_contact_number IS NOT NULL THEN
                update_sql := update_sql || ', emergency_contact_number = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_emergency_contact_number);
            END IF;
            
            IF p_notes IS NOT NULL THEN
                update_sql := update_sql || ', notes = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_notes);
            END IF;
            
            IF p_is_active IS NOT NULL THEN
                update_sql := update_sql || ', is_active = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_is_active);
            END IF;
            
            IF p_accent_color IS NOT NULL THEN
                update_sql := update_sql || ', accent_color = $' || (array_length(update_values, 1) + 1);
                update_values := array_append(update_values, p_accent_color);
            END IF;

            -- Add WHERE clause
            where_clause := ' WHERE entity_id = $' || (array_length(update_values, 1) + 1) || ' RETURNING *';
            update_values := array_append(update_values, p_entity_id::TEXT);
            
            update_sql := update_sql || where_clause;

            -- Execute the dynamic UPDATE
            EXECUTE update_sql USING VARIADIC update_values INTO entity_record;

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

        ELSE
            RETURN json_build_object(
                'success', false,
                'message', 'Operation not implemented yet'
            );
    END CASE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;

-- Comment
COMMENT ON FUNCTION public.crud_entity_master_l01 IS 'Comprehensive CRUD function without COALESCE type issues';