-- Check all constraints on the entity_master_l01 table

SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    tc.table_schema,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule,
    cc.check_clause
FROM 
    information_schema.table_constraints AS tc 
    LEFT JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
      AND tc.table_schema = rc.constraint_schema
    LEFT JOIN information_schema.check_constraints AS cc
      ON tc.constraint_name = cc.constraint_name
      AND tc.table_schema = cc.constraint_schema
WHERE 
    tc.table_name = 'entity_master_l01' 
    AND tc.table_schema = 'global'
ORDER BY tc.constraint_type, tc.constraint_name;