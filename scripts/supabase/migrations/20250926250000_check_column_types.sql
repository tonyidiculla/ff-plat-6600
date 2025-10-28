-- Check column types in entity_master_l01

SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'global' 
  AND table_name = 'entity_master_l01'
ORDER BY ordinal_position;