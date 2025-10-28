-- Check what functions exist and what columns are in the table

-- List all functions with 'crud_entity' in the name
SELECT 
    routine_name,
    routine_type,
    external_name
FROM information_schema.routines 
WHERE routine_name LIKE '%crud_entity%'
ORDER BY routine_name;

-- Check table structure
SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'global' 
  AND table_name = 'entity_master_l01'
ORDER BY ordinal_position;