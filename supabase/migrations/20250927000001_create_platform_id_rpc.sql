-- Create RPC function to access global.platform_id_categories table
CREATE OR REPLACE FUNCTION get_platform_id_categories()
RETURNS TABLE (
  id uuid,
  category_code text,
  category_name text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, category_code, category_name, created_at, updated_at 
  FROM global.platform_id_categories 
  ORDER BY category_code;
$$;

-- Create RPC function to generate platform ID based on category
CREATE OR REPLACE FUNCTION generate_platform_id(entity_type text DEFAULT 'organization')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_prefix text;
  sequence_number text;
  platform_id text;
BEGIN
  -- Get the category code for the entity type
  SELECT category_code INTO category_prefix
  FROM global.platform_id_categories
  WHERE LOWER(category_name) = LOWER(entity_type)
     OR category_code = UPPER(entity_type)
  LIMIT 1;
  
  -- If no specific category found, use default 'OR' for organization
  IF category_prefix IS NULL THEN
    category_prefix := 'OR';
  END IF;
  
  -- Generate sequence number (6 digits based on timestamp)
  sequence_number := LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000000)::TEXT, 6, '0');
  
  -- Combine prefix and sequence
  platform_id := category_prefix || sequence_number;
  
  RETURN platform_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_platform_id_categories() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_platform_id(text) TO authenticated;