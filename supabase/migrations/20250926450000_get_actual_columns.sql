-- Get actual column list from entity_master_l01 table

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'entity_master_l01' 
    AND table_schema = 'global'
ORDER BY ordinal_position;