-- Get all columns from emr_vitals_catalog table in public schema
-- Copy the column_name results to use as CSV list

SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'emr_vitals_catalog'
ORDER BY ordinal_position;

-- To get as CSV list, run this:
SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) as csv_columns
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'emr_vitals_catalog';

-- To see sample data from the table:
SELECT * FROM public.emr_vitals_catalog LIMIT 5;

-- To count rows:
SELECT COUNT(*) as total_rows FROM public.emr_vitals_catalog;
