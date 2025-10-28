-- Check if global.profiles table exists and get its structure

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'global'
ORDER BY ordinal_position;