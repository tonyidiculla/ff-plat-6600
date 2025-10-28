-- Create a debug version of the function that will tell us which column has the type mismatch

DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
    entity_record RECORD;
BEGIN
    IF operation = 'UPDATE' THEN
        IF p_entity_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID required');
        END IF;

        -- Test each column individually to find the type mismatch
        BEGIN
            UPDATE global.entity_master_l01 SET
                entity_name = COALESCE(p_entity_name, entity_name)
            WHERE entity_id = p_entity_id;
            
            RETURN json_build_object('success', true, 'message', 'entity_name update worked');
        EXCEPTION
            WHEN OTHERS THEN
                RETURN json_build_object('success', false, 'message', 'entity_name failed: ' || SQLERRM);
        END;
    
    ELSIF operation = 'READ' THEN
        SELECT json_agg(row_to_json(entities)) INTO result_data
        FROM (
            SELECT * FROM global.entity_master_l01
            ORDER BY created_at DESC
            LIMIT 5
        ) entities;

        RETURN json_build_object('success', true, 'data', COALESCE(result_data, '[]'::json));
    END IF;
    
    RETURN json_build_object('success', false, 'message', 'Invalid operation');
END;
$$;

GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;