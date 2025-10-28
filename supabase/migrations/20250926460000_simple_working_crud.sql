-- Create a simple CRUD function with just the columns we know work

DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL,
    p_entity_type TEXT DEFAULT NULL,
    p_organization_id UUID DEFAULT NULL,
    p_is_active TEXT DEFAULT NULL
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
            entity_id, entity_name, display_name, billing_email, 
            vat_gst_number, entity_type, organization_id, is_active,
            entity_platform_id
        ) VALUES (
            new_entity_id,
            p_entity_name,
            COALESCE(p_display_name, p_entity_name),
            p_billing_email,
            p_vat_gst_number,
            p_entity_type,
            p_organization_id,
            COALESCE(p_is_active, 'active'),
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

        -- Validate is_active value
        IF p_is_active IS NOT NULL AND p_is_active NOT IN ('active', 'inactive', 'pending', 'suspended') THEN
            RETURN json_build_object('success', false, 'message', 'is_active must be one of: active, inactive, pending, suspended');
        END IF;

        -- Update only provided fields - DO NOT update entity_platform_id due to FK constraints
        UPDATE global.entity_master_l01 SET
            entity_name = COALESCE(p_entity_name, entity_name),
            display_name = COALESCE(p_display_name, display_name),
            billing_email = COALESCE(p_billing_email, billing_email),
            vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
            entity_type = COALESCE(p_entity_type, entity_type),
            organization_id = COALESCE(p_organization_id, organization_id),
            is_active = COALESCE(p_is_active, is_active),
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