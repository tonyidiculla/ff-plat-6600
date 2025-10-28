-- ============================================================
-- PETS TABLE STRUCTURE AND DATA CHECK
-- ============================================================
-- Run these queries in Supabase SQL Editor

-- 1. Check pets table structure
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pets'
ORDER BY ordinal_position;

-- 2. Get column names as CSV
SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) as csv_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'pets';

-- 3. Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'pets';

-- 4. List existing RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'pets'
ORDER BY policyname;

-- 5. Count pets in table
SELECT COUNT(*) as total_pets FROM public.pets;

-- 6. Sample data (first 10 records)
SELECT * FROM public.pets LIMIT 10;

-- 7. Check foreign key relationships
SELECT
  tc.table_schema, 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name = 'pets';

-- 8. Check indexes on pets table
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'pets';
