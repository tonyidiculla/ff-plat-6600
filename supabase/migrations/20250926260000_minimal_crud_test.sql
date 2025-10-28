-- Create a minimal CRUD function to test specific fields

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.crud_entity_master_l01_minimal;

-- Create minimal CRUD function for testing
CREATE OR REPLACE FUNCTION public.crud_entity_master_l01_minimal(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_display_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_billing_email TEXT DEFAULT NULL,
    p_vat_gst_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
    entity_record RECORD;
BEGIN
    -- Validate operation
    IF operation NOT IN ('UPDATE', 'READ') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid operation. Must be UPDATE or READ.'
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
                    ORDER BY created_at DESC
                    LIMIT 10
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

            -- Update only safe text fields
            UPDATE global.entity_master_l01 SET
                entity_name = COALESCE(p_entity_name, entity_name),
                display_name = COALESCE(p_display_name, display_name),
                description = COALESCE(p_description, description),
                billing_email = COALESCE(p_billing_email, billing_email),
                vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
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
    END CASE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01_minimal TO service_role;
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01_minimal TO authenticated;