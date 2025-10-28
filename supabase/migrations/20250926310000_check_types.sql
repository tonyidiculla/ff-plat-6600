-- Check actual column types and compare with function parameters

-- First, get column information from information_schema
SELECT 
    column_name, 
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'global' 
  AND table_name = 'entity_master_l01'
ORDER BY ordinal_position;

-- Also check with pg_typeof on actual data
SELECT 
    pg_typeof(entity_id) as entity_id_type,
    pg_typeof(entity_name) as entity_name_type,
    pg_typeof(billing_email) as billing_email_type,
    pg_typeof(vat_gst_number) as vat_gst_number_type,
    pg_typeof(organization_id) as organization_id_type,
    pg_typeof(assigned_manager_id) as assigned_manager_id_type,
    pg_typeof(created_by) as created_by_type,
    pg_typeof(updated_by) as updated_by_type,
    pg_typeof(is_active) as is_active_type,
    pg_typeof(is_regulated) as is_regulated_type,
    pg_typeof(incorporation_date) as incorporation_date_type,
    pg_typeof(accreditation_details) as accreditation_details_type,
    pg_typeof(logo_storage) as logo_storage_type
FROM global.entity_master_l01 
LIMIT 1;