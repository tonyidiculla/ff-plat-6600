-- Create the enhanced platform ID generation function with proper structure
-- [ID Type][Category Code][Unique Identifier]
CREATE OR REPLACE FUNCTION generate_enhanced_platform_id(
  entity_type text DEFAULT 'organization',
  id_type text DEFAULT 'C' -- Default to 'C' for Company/Organization
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_code text;
  unique_identifier text;
  platform_id text;
BEGIN
  -- Get the category code for the entity type
  SELECT pic.category_code INTO category_code
  FROM global.platform_id_categories pic
  WHERE LOWER(pic.category_name) = LOWER(entity_type)
     OR pic.category_code = UPPER(entity_type)
  LIMIT 1;
  
  -- If no specific category found, use default mapping based on entity type
  IF category_code IS NULL THEN
    CASE LOWER(entity_type)
      WHEN 'organization', 'company' THEN category_code := '00'; -- Default
      WHEN 'hospital', 'clinic' THEN category_code := '01'; -- Hospital
      WHEN 'estore', 'online store' THEN category_code := '02'; -- eStore
      WHEN 'retail store', 'physical store', 'pstore' THEN category_code := '03'; -- Retail Store
      WHEN 'channel partner', 'partner' THEN category_code := '04'; -- Channel Partner
      WHEN 'platform support', 'support', 'admin' THEN category_code := '05'; -- Platform Support
      ELSE category_code := '00'; -- Default fallback
    END CASE;
  END IF;
  
  -- Generate 6-character alphanumeric unique identifier
  -- Combining timestamp + random components for uniqueness
  unique_identifier := UPPER(
    LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 1000)::TEXT, 3, '0') ||
    SUBSTRING(MD5(RANDOM()::TEXT), 1, 3)
  );
  
  -- Combine ID Type + Category Code + Unique Identifier
  platform_id := UPPER(id_type) || category_code || unique_identifier;
  
  RETURN platform_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_enhanced_platform_id(text, text) TO authenticated;