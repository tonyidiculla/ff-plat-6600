-- Create comprehensive CRUD RPC function for global.profiles table
-- This function provides CREATE, READ, UPDATE, DELETE operations for profiles

CREATE OR REPLACE FUNCTION crud_profiles(
  operation TEXT,
  profile_data JSONB DEFAULT NULL,
  search_filters JSONB DEFAULT NULL,
  profile_id UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  search_term TEXT;
  query_text TEXT;
  where_conditions TEXT[];
  condition TEXT;
BEGIN
  -- Validate operation
  IF operation NOT IN ('create', 'read', 'update', 'delete', 'search') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid operation. Must be: create, read, update, delete, or search');
  END IF;

  CASE operation
    WHEN 'create' THEN
      -- Create new profile
      IF profile_data IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile data is required for create operation');
      END IF;

      INSERT INTO global.profiles (
        user_id,
        email,
        first_name,
        last_name,
        full_name,
        phone,
        address,
        city,
        state_province,
        postal_code,
        country,
        date_of_birth,
        gender,
        emergency_contact_name,
        emergency_contact_phone,
        emergency_contact_relationship,
        occupation,
        organization_id,
        hospital_id,
        is_approved,
        created_at,
        updated_at
      )
      VALUES (
        COALESCE((profile_data->>'user_id')::UUID, gen_random_uuid()),
        profile_data->>'email',
        profile_data->>'first_name',
        profile_data->>'last_name',
        COALESCE(profile_data->>'full_name', CONCAT(profile_data->>'first_name', ' ', profile_data->>'last_name')),
        profile_data->>'phone',
        profile_data->>'address',
        profile_data->>'city',
        profile_data->>'state_province',
        profile_data->>'postal_code',
        profile_data->>'country',
        CASE 
          WHEN profile_data->>'date_of_birth' IS NOT NULL 
          THEN (profile_data->>'date_of_birth')::DATE 
          ELSE NULL 
        END,
        profile_data->>'gender',
        profile_data->>'emergency_contact_name',
        profile_data->>'emergency_contact_phone',
        profile_data->>'emergency_contact_relationship',
        profile_data->>'occupation',
        CASE 
          WHEN profile_data->>'organization_id' IS NOT NULL 
          THEN (profile_data->>'organization_id')::UUID 
          ELSE NULL 
        END,
        CASE 
          WHEN profile_data->>'hospital_id' IS NOT NULL 
          THEN (profile_data->>'hospital_id')::UUID 
          ELSE NULL 
        END,
        COALESCE((profile_data->>'is_approved')::BOOLEAN, false),
        NOW(),
        NOW()
      )
      RETURNING to_jsonb(global.profiles.*) INTO result;

      RETURN jsonb_build_object('success', true, 'data', result);

    WHEN 'read' THEN
      -- Read profile(s)
      IF profile_id IS NOT NULL THEN
        -- Get specific profile by ID
        SELECT to_jsonb(global.profiles.*) INTO result
        FROM global.profiles
        WHERE id = profile_id OR user_id = profile_id;

        IF result IS NULL THEN
          RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
        END IF;

        RETURN jsonb_build_object('success', true, 'data', result);
      ELSE
        -- Get multiple profiles with optional filters
        SELECT jsonb_agg(to_jsonb(global.profiles.*)) INTO result
        FROM global.profiles
        WHERE 
          CASE 
            WHEN search_filters IS NOT NULL THEN
              (search_filters ? 'is_approved' IS FALSE OR is_approved = (search_filters->>'is_approved')::BOOLEAN) AND
              (search_filters ? 'organization_id' IS FALSE OR organization_id = (search_filters->>'organization_id')::UUID) AND
              (search_filters ? 'hospital_id' IS FALSE OR hospital_id = (search_filters->>'hospital_id')::UUID) AND
              (search_filters ? 'country' IS FALSE OR country = search_filters->>'country')
            ELSE TRUE
          END
        ORDER BY created_at DESC
        LIMIT limit_count
        OFFSET offset_count;

        RETURN jsonb_build_object('success', true, 'data', COALESCE(result, '[]'::jsonb));
      END IF;

    WHEN 'search' THEN
      -- Search profiles by text
      IF search_filters IS NULL OR NOT (search_filters ? 'search_term') THEN
        RETURN jsonb_build_object('success', false, 'error', 'search_term is required in search_filters for search operation');
      END IF;

      search_term := search_filters->>'search_term';
      
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'user_id', user_id,
          'email', email,
          'first_name', first_name,
          'last_name', last_name,
          'full_name', full_name,
          'phone', phone,
          'organization_id', organization_id,
          'hospital_id', hospital_id,
          'is_approved', is_approved
        )
      ) INTO result
      FROM global.profiles
      WHERE 
        (email ILIKE '%' || search_term || '%' OR
         first_name ILIKE '%' || search_term || '%' OR
         last_name ILIKE '%' || search_term || '%' OR
         full_name ILIKE '%' || search_term || '%' OR
         phone ILIKE '%' || search_term || '%') AND
        (search_filters ? 'is_approved' IS FALSE OR is_approved = (search_filters->>'is_approved')::BOOLEAN) AND
        (search_filters ? 'organization_id' IS FALSE OR organization_id = (search_filters->>'organization_id')::UUID) AND
        (search_filters ? 'hospital_id' IS FALSE OR hospital_id = (search_filters->>'hospital_id')::UUID)
      ORDER BY 
        CASE 
          WHEN email ILIKE search_term || '%' THEN 1
          WHEN first_name ILIKE search_term || '%' OR last_name ILIKE search_term || '%' THEN 2
          WHEN full_name ILIKE search_term || '%' THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT limit_count;

      RETURN jsonb_build_object('success', true, 'data', COALESCE(result, '[]'::jsonb));

    WHEN 'update' THEN
      -- Update profile
      IF profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile ID is required for update operation');
      END IF;

      IF profile_data IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile data is required for update operation');
      END IF;

      UPDATE global.profiles SET
        email = COALESCE(profile_data->>'email', email),
        first_name = COALESCE(profile_data->>'first_name', first_name),
        last_name = COALESCE(profile_data->>'last_name', last_name),
        full_name = COALESCE(
          profile_data->>'full_name', 
          CASE 
            WHEN profile_data->>'first_name' IS NOT NULL OR profile_data->>'last_name' IS NOT NULL 
            THEN CONCAT(COALESCE(profile_data->>'first_name', first_name), ' ', COALESCE(profile_data->>'last_name', last_name))
            ELSE full_name
          END
        ),
        phone = COALESCE(profile_data->>'phone', phone),
        address = COALESCE(profile_data->>'address', address),
        city = COALESCE(profile_data->>'city', city),
        state_province = COALESCE(profile_data->>'state_province', state_province),
        postal_code = COALESCE(profile_data->>'postal_code', postal_code),
        country = COALESCE(profile_data->>'country', country),
        date_of_birth = COALESCE(
          CASE 
            WHEN profile_data->>'date_of_birth' IS NOT NULL 
            THEN (profile_data->>'date_of_birth')::DATE 
            ELSE NULL 
          END, 
          date_of_birth
        ),
        gender = COALESCE(profile_data->>'gender', gender),
        emergency_contact_name = COALESCE(profile_data->>'emergency_contact_name', emergency_contact_name),
        emergency_contact_phone = COALESCE(profile_data->>'emergency_contact_phone', emergency_contact_phone),
        emergency_contact_relationship = COALESCE(profile_data->>'emergency_contact_relationship', emergency_contact_relationship),
        occupation = COALESCE(profile_data->>'occupation', occupation),
        organization_id = COALESCE(
          CASE 
            WHEN profile_data->>'organization_id' IS NOT NULL 
            THEN (profile_data->>'organization_id')::UUID 
            ELSE NULL 
          END, 
          organization_id
        ),
        hospital_id = COALESCE(
          CASE 
            WHEN profile_data->>'hospital_id' IS NOT NULL 
            THEN (profile_data->>'hospital_id')::UUID 
            ELSE NULL 
          END, 
          hospital_id
        ),
        is_approved = COALESCE((profile_data->>'is_approved')::BOOLEAN, is_approved),
        updated_at = NOW()
      WHERE id = profile_id OR user_id = profile_id
      RETURNING to_jsonb(global.profiles.*) INTO result;

      IF result IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
      END IF;

      RETURN jsonb_build_object('success', true, 'data', result);

    WHEN 'delete' THEN
      -- Delete profile (soft delete by setting is_approved to false, or hard delete)
      IF profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile ID is required for delete operation');
      END IF;

      -- Check if hard delete is requested
      IF search_filters IS NOT NULL AND (search_filters->>'hard_delete')::BOOLEAN = true THEN
        DELETE FROM global.profiles
        WHERE id = profile_id OR user_id = profile_id
        RETURNING to_jsonb(global.profiles.*) INTO result;
      ELSE
        -- Soft delete by setting is_approved to false
        UPDATE global.profiles SET
          is_approved = false,
          updated_at = NOW()
        WHERE id = profile_id OR user_id = profile_id
        RETURNING to_jsonb(global.profiles.*) INTO result;
      END IF;

      IF result IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
      END IF;

      RETURN jsonb_build_object('success', true, 'data', result);

  END CASE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION crud_profiles TO authenticated;

-- Create convenience wrapper functions for common operations

-- Search profiles function (backward compatibility)
CREATE OR REPLACE FUNCTION search_user_profiles(
  search_term TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT crud_profiles(
    'search',
    NULL,
    jsonb_build_object('search_term', search_term, 'is_approved', true),
    NULL,
    limit_count,
    0
  );
$$;

GRANT EXECUTE ON FUNCTION search_user_profiles TO authenticated;

-- Get user profiles for assignment
CREATE OR REPLACE FUNCTION get_user_profiles_for_assignment()
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT crud_profiles(
    'read',
    NULL,
    jsonb_build_object('is_approved', true),
    NULL,
    100,
    0
  );
$$;

GRANT EXECUTE ON FUNCTION get_user_profiles_for_assignment TO authenticated;