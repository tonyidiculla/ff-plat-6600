-- Simplified CRUD function to identify the exact type mismatch

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.crud_entity_master_l01;

-- Create a much simpler function to isolate the issue
CREATE OR REPLACE FUNCTION public.crud_entity_master_l01(
    operation TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
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
    IF operation NOT IN ('CREATE', 'READ', 'UPDATE', 'DELETE') THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Invalid operation. Must be CREATE, READ, UPDATE, or DELETE.'
        );
    END IF;

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
                -- Get all entities
                SELECT json_agg(row_to_json(entities)) INTO result_data
                FROM (
                    SELECT * FROM global.entity_master_l01
                    ORDER BY created_at DESC
                    LIMIT 50
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

            -- Simple update with only safe text fields
            UPDATE global.entity_master_l01 SET
                entity_name = CASE WHEN p_entity_name IS NOT NULL THEN p_entity_name ELSE entity_name END,
                notes = CASE WHEN p_notes IS NOT NULL THEN p_notes ELSE notes END,
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

        ELSE
            RETURN json_build_object(
                'success', false,
                'message', 'Operation not implemented in simplified function'
            );
    END CASE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crud_entity_master_l01 TO service_role;

-- Comment
COMMENT ON FUNCTION public.crud_entity_master_l01 IS 'Simplified CRUD function to debug type issues';