-- Create a test function to update only one column at a time to find the problematic field

DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    test_column TEXT DEFAULT NULL,
    test_value TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
    entity_record RECORD;
    update_sql TEXT;
BEGIN
    IF operation = 'READ' THEN
        SELECT json_agg(row_to_json(entities)) INTO result_data
        FROM (SELECT * FROM global.entity_master_l01 ORDER BY created_at DESC LIMIT 5) entities;
        RETURN json_build_object('success', true, 'data', COALESCE(result_data, '[]'::json));
        
    ELSIF operation = 'TEST_COLUMN' THEN
        IF p_entity_id IS NULL OR test_column IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID and test_column required');
        END IF;

        -- Test each column individually using dynamic SQL
        CASE test_column
            WHEN 'entity_name' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        entity_name = CASE WHEN test_value IS NOT NULL THEN test_value ELSE entity_name END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'entity_name - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'entity_name FAILED: ' || SQLERRM);
                END;

            WHEN 'billing_email' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        billing_email = CASE WHEN test_value IS NOT NULL THEN test_value ELSE billing_email END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'billing_email - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'billing_email FAILED: ' || SQLERRM);
                END;

            WHEN 'vat_gst_number' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        vat_gst_number = CASE WHEN test_value IS NOT NULL THEN test_value ELSE vat_gst_number END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'vat_gst_number - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'vat_gst_number FAILED: ' || SQLERRM);
                END;

            WHEN 'display_name' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        display_name = CASE WHEN test_value IS NOT NULL THEN test_value ELSE display_name END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'display_name - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'display_name FAILED: ' || SQLERRM);
                END;

            WHEN 'organization_id' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        organization_id = CASE WHEN test_value::UUID IS NOT NULL THEN test_value::UUID ELSE organization_id END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'organization_id - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'organization_id FAILED: ' || SQLERRM);
                END;

            WHEN 'is_active' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        is_active = CASE WHEN test_value IS NOT NULL THEN test_value ELSE is_active END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'is_active - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'is_active FAILED: ' || SQLERRM);
                END;

            WHEN 'entity_type' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        entity_type = CASE WHEN test_value IS NOT NULL THEN test_value ELSE entity_type END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'entity_type - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'entity_type FAILED: ' || SQLERRM);
                END;

            WHEN 'entity_platform_id' THEN
                BEGIN
                    UPDATE global.entity_master_l01 SET 
                        entity_platform_id = CASE WHEN test_value IS NOT NULL THEN test_value ELSE entity_platform_id END
                    WHERE entity_id = p_entity_id;
                    RETURN json_build_object('success', true, 'message', 'entity_platform_id - SUCCESS');
                EXCEPTION WHEN OTHERS THEN
                    RETURN json_build_object('success', false, 'message', 'entity_platform_id FAILED: ' || SQLERRM);
                END;

            ELSE
                RETURN json_build_object('success', false, 'message', 'Unknown test column: ' || test_column);
        END CASE;
    END IF;
    
    RETURN json_build_object('success', false, 'message', 'Invalid operation');
END;
$$;

GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;