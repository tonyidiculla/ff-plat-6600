-- Create a debug UPDATE function to test each column individually

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
    IF operation = 'READ' THEN
        SELECT json_agg(row_to_json(entities)) INTO result_data
        FROM (
            SELECT * FROM global.entity_master_l01
            ORDER BY created_at DESC
            LIMIT 5
        ) entities;
        RETURN json_build_object('success', true, 'data', COALESCE(result_data, '[]'::json));
        
    ELSIF operation = 'UPDATE' THEN
        IF p_entity_id IS NULL THEN
            RETURN json_build_object('success', false, 'message', 'Entity ID required');
        END IF;

        -- Test the most basic update possible
        BEGIN
            UPDATE global.entity_master_l01 SET
                updated_at = NOW()
            WHERE entity_id = p_entity_id
            RETURNING * INTO entity_record;
            
            IF FOUND THEN
                RETURN json_build_object('success', true, 'message', 'updated_at only - SUCCESS');
            ELSE
                RETURN json_build_object('success', false, 'message', 'Entity not found');
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RETURN json_build_object('success', false, 'message', 'updated_at failed: ' || SQLERRM);
        END;
        
    END IF;
    
    RETURN json_build_object('success', false, 'message', 'Invalid operation');
END;
$$;

GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;