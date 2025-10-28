-- Create a function to investigate the constraints directly

DROP FUNCTION IF EXISTS public.investigate_constraints;

CREATE OR REPLACE FUNCTION public.investigate_constraints()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result_data JSON;
    constraint_info JSON;
    employee_deps JSON;
    check_constraint_info TEXT;
BEGIN
    -- 1. Get constraint information
    SELECT json_agg(
        json_build_object(
            'constraint_name', tc.constraint_name,
            'constraint_type', tc.constraint_type,
            'column_name', kcu.column_name,
            'foreign_table', ccu.table_name,
            'foreign_column', ccu.column_name
        )
    ) INTO constraint_info
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'entity_master_l01' 
        AND tc.table_schema = 'global';

    -- 2. Check employee role assignments dependencies
    SELECT json_agg(
        json_build_object(
            'entity_platform_id', entity_platform_id,
            'id', id
        )
    ) INTO employee_deps
    FROM global.employee_role_assignments
    LIMIT 10;

    -- 3. Get check constraint details
    SELECT cc.check_clause INTO check_constraint_info
    FROM information_schema.check_constraints cc
    JOIN information_schema.table_constraints tc 
        ON cc.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'entity_master_l01' 
        AND tc.table_schema = 'global'
        AND cc.constraint_name = 'global_org_entity_master_status_check';

    -- 4. Get sample entity data
    SELECT json_agg(
        json_build_object(
            'entity_id', entity_id,
            'entity_platform_id', entity_platform_id,
            'entity_name', entity_name,
            'is_active', is_active
        )
    ) INTO result_data
    FROM global.entity_master_l01
    LIMIT 5;

    RETURN json_build_object(
        'success', true,
        'constraints', COALESCE(constraint_info, '[]'::json),
        'employee_dependencies', COALESCE(employee_deps, '[]'::json),
        'check_constraint', check_constraint_info,
        'sample_entities', COALESCE(result_data, '[]'::json)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.investigate_constraints TO service_role;