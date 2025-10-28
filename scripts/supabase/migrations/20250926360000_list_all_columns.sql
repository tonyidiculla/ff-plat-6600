-- List all columns from entity_master_l01 table with their types

SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'global' 
  AND table_name = 'entity_master_l01'
ORDER BY ordinal_position;