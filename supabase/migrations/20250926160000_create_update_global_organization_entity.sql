-- Migration: Create missing update_global_organization_entity function
-- Date: 2025-09-26
-- Purpose: Add the missing function to update organization entities

CREATE OR REPLACE FUNCTION public.update_global_organization_entity(
  p_entity_id text,
  p_entity_name text,
  p_billing_email text,
  p_country text,
  p_entity_type text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_state text DEFAULT NULL,
  p_postal_code text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_website text DEFAULT NULL,
  p_contact_person text DEFAULT NULL,
  p_assigned_manager_id text DEFAULT NULL,
  p_assigned_manager_contact text DEFAULT NULL,
  p_currency text DEFAULT NULL,
  p_language text DEFAULT NULL,
  p_vat_gst_number text DEFAULT NULL,
  p_emergency_contact_number text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_is_active boolean DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_updated_count integer;
BEGIN
  -- Update the organization entity in global.entity_master_l01
  UPDATE global.entity_master_l01 
  SET 
    entity_name = COALESCE(p_entity_name, entity_name),
    billing_email = COALESCE(p_billing_email, billing_email),
    country = COALESCE(p_country, country),
    entity_type = COALESCE(p_entity_type, entity_type),
    address = COALESCE(p_address, address),
    city = COALESCE(p_city, city),
    state = COALESCE(p_state, state),
    postal_code = COALESCE(p_postal_code, postal_code),
    phone = COALESCE(p_phone, phone),
    email = COALESCE(p_email, email),
    website = COALESCE(p_website, website),
    contact_person = COALESCE(p_contact_person, contact_person),
    assigned_manager_id = COALESCE(p_assigned_manager_id::uuid, assigned_manager_id),
    assigned_manager_contact = COALESCE(p_assigned_manager_contact, assigned_manager_contact),
    currency = COALESCE(p_currency, currency),
    language = COALESCE(p_language, language),
    vat_gst_number = COALESCE(p_vat_gst_number, vat_gst_number),
    emergency_contact_number = COALESCE(p_emergency_contact_number, emergency_contact_number),
    notes = COALESCE(p_notes, notes),
    description = COALESCE(p_description, description),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE entity_id = p_entity_id::uuid;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count = 0 THEN
    v_result := json_build_object(
      'success', false,
      'error', 'Organization entity not found',
      'entity_id', p_entity_id
    );
  ELSE
    v_result := json_build_object(
      'success', true,
      'message', 'Organization entity updated successfully',
      'entity_id', p_entity_id,
      'updated_count', v_updated_count
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_global_organization_entity TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_global_organization_entity TO service_role;