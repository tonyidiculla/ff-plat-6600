-- Fix ownership table creation by using correct primary key reference

-- First check what the primary key is for entity_master_l01
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'entity_master_l01' 
    AND table_schema = 'global'
    AND column_name IN ('id', 'entity_id')
ORDER BY ordinal_position;