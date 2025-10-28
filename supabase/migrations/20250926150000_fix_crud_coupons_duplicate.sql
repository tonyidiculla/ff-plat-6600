-- Fix: Remove duplicate crud_coupons functions and create single clean version
-- Date: 2025-09-26
-- Purpose: Fix function overload conflict by dropping all versions and recreating one clean version

-- Drop all existing crud_coupons functions (with any parameter signature)
DROP FUNCTION IF EXISTS public.crud_coupons(text, jsonb, jsonb, uuid, jsonb);
DROP FUNCTION IF EXISTS public.crud_coupons(text, jsonb, uuid, jsonb);
DROP FUNCTION IF EXISTS public.crud_coupons(text, jsonb, jsonb, text, jsonb);
DROP FUNCTION IF EXISTS public.crud_coupons(text, jsonb, text, jsonb);

-- Create the clean, single version of crud_coupons
CREATE OR REPLACE FUNCTION public.crud_coupons(
  action text,
  coupon_data jsonb DEFAULT NULL,
  p_coupon_id uuid DEFAULT NULL,
  filters jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_row record;
  v_query text;
  v_where_conditions text[] = ARRAY[]::text[];
  v_limit int DEFAULT 50;
  v_offset int DEFAULT 0;
  v_total_count int;
BEGIN
  -- Validate action parameter
  IF action NOT IN ('create', 'read', 'get', 'update', 'delete', 'validate', 'apply', 'stats') THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Invalid action. Must be one of: create, read, get, update, delete, validate, apply, stats');
  END IF;

  CASE action
    WHEN 'create' THEN
      -- Validate required fields
      IF coupon_data IS NULL OR NOT (coupon_data ? 'code') THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon code is required');
      END IF;

      -- Check for duplicate code
      IF EXISTS (SELECT 1 FROM global.coupons WHERE code = coupon_data->>'code') THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon code already exists');
      END IF;

      INSERT INTO global.coupons (
        code, description, discount_type, discount_value, currency,
        valid_from, valid_until, usage_limit, coupon_type,
        minimum_order_value, maximum_discount_amount,
        first_time_user_only, stackable, campaign_name, is_active, created_by
      ) VALUES (
        coupon_data->>'code',
        coupon_data->>'description',
        (coupon_data->>'discount_type')::text,
        (coupon_data->>'discount_value')::decimal(10,2),
        COALESCE(coupon_data->>'currency', 'USD'),
        (coupon_data->>'valid_from')::timestamp with time zone,
        (coupon_data->>'valid_until')::timestamp with time zone,
        (coupon_data->>'usage_limit')::integer,
        COALESCE(coupon_data->>'coupon_type', 'promo'),
        (coupon_data->>'minimum_order_value')::decimal(10,2),
        (coupon_data->>'maximum_discount_amount')::decimal(10,2),
        COALESCE((coupon_data->>'first_time_user_only')::boolean, false),
        COALESCE((coupon_data->>'stackable')::boolean, false),
        coupon_data->>'campaign_name',
        COALESCE((coupon_data->>'is_active')::boolean, true),
        (coupon_data->>'created_by')::uuid
      ) RETURNING * INTO v_row;

      RETURN jsonb_build_object('status', 'success', 'data', to_jsonb(v_row));

    WHEN 'read' THEN
      -- Build query with filters
      v_query := 'SELECT * FROM global.coupons WHERE true';
      
      IF filters IS NOT NULL THEN
        -- Apply filters
        IF filters ? 'search' AND filters->>'search' != '' THEN
          v_where_conditions := array_append(v_where_conditions, 
            format('(code ILIKE %L OR description ILIKE %L)', 
              '%' || filters->>'search' || '%',
              '%' || filters->>'search' || '%'
            ));
        END IF;

        IF filters ? 'status' THEN
          CASE filters->>'status'
            WHEN 'active' THEN
              v_where_conditions := array_append(v_where_conditions, 'is_active = true');
            WHEN 'inactive' THEN  
              v_where_conditions := array_append(v_where_conditions, 'is_active = false');
            WHEN 'expired' THEN
              v_where_conditions := array_append(v_where_conditions, 
                'valid_until IS NOT NULL AND valid_until < NOW()');
          END CASE;
        END IF;

        IF filters ? 'coupon_type' THEN
          v_where_conditions := array_append(v_where_conditions,
            format('coupon_type = %L', filters->>'coupon_type'));
        END IF;

        -- Pagination
        IF filters ? 'limit' THEN
          v_limit := (filters->>'limit')::int;
        END IF;
        IF filters ? 'offset' THEN
          v_offset := (filters->>'offset')::int;
        END IF;
      END IF;

      -- Add WHERE conditions
      IF array_length(v_where_conditions, 1) > 0 THEN
        v_query := v_query || ' AND ' || array_to_string(v_where_conditions, ' AND ');
      END IF;

      -- Get total count for pagination
      EXECUTE format('SELECT COUNT(*) FROM (%s) t', v_query) INTO v_total_count;

      -- Add ordering and pagination
      v_query := v_query || ' ORDER BY created_at DESC';
      v_query := v_query || format(' LIMIT %s OFFSET %s', v_limit, v_offset);

      -- Execute query
      EXECUTE format('SELECT jsonb_agg(to_jsonb(t)) FROM (%s) t', v_query) INTO v_result;
      
      RETURN jsonb_build_object(
        'status', 'success', 
        'data', COALESCE(v_result, '[]'::jsonb),
        'total', v_total_count,
        'limit', v_limit,
        'offset', v_offset
      );

    WHEN 'get' THEN
      -- Get single coupon by ID
      IF p_coupon_id IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon ID is required');
      END IF;

      SELECT * INTO v_row FROM global.coupons WHERE id = p_coupon_id;
      
      IF v_row IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon not found');
      END IF;

      RETURN jsonb_build_object('status', 'success', 'data', to_jsonb(v_row));

    WHEN 'update' THEN
      -- Update existing coupon
      IF p_coupon_id IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon ID is required');
      END IF;

      IF coupon_data IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon data is required');
      END IF;

      -- Check if coupon exists
      SELECT * INTO v_row FROM global.coupons WHERE id = p_coupon_id FOR UPDATE;
      IF v_row IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon not found');
      END IF;

      -- Check for duplicate code (if code is being updated)
      IF coupon_data ? 'code' THEN
        IF EXISTS (SELECT 1 FROM global.coupons WHERE code = coupon_data->>'code' AND id <> p_coupon_id) THEN
          RETURN jsonb_build_object('status', 'error', 'message', 'Coupon code already exists');
        END IF;
      END IF;

      UPDATE global.coupons SET
        code = COALESCE(coupon_data->>'code', code),
        description = COALESCE(coupon_data->>'description', description),
        discount_type = COALESCE(coupon_data->>'discount_type', discount_type),
        discount_value = COALESCE((coupon_data->>'discount_value')::decimal(10,2), discount_value),
        currency = COALESCE(coupon_data->>'currency', currency),
        valid_from = COALESCE((coupon_data->>'valid_from')::timestamp with time zone, valid_from),
        valid_until = COALESCE((coupon_data->>'valid_until')::timestamp with time zone, valid_until),
        usage_limit = COALESCE((coupon_data->>'usage_limit')::integer, usage_limit),
        coupon_type = COALESCE(coupon_data->>'coupon_type', coupon_type),
        minimum_order_value = COALESCE((coupon_data->>'minimum_order_value')::decimal(10,2), minimum_order_value),
        maximum_discount_amount = COALESCE((coupon_data->>'maximum_discount_amount')::decimal(10,2), maximum_discount_amount),
        first_time_user_only = COALESCE((coupon_data->>'first_time_user_only')::boolean, first_time_user_only),
        stackable = COALESCE((coupon_data->>'stackable')::boolean, stackable),
        campaign_name = COALESCE(coupon_data->>'campaign_name', campaign_name),
        is_active = COALESCE((coupon_data->>'is_active')::boolean, is_active),
        updated_at = NOW()
      WHERE id = p_coupon_id
      RETURNING * INTO v_row;

      RETURN jsonb_build_object('status', 'success', 'data', to_jsonb(v_row));

    WHEN 'delete' THEN
      -- Delete coupon
      IF p_coupon_id IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon ID is required');
      END IF;

      DELETE FROM global.coupons WHERE id = p_coupon_id RETURNING * INTO v_row;
      
      IF v_row IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon not found');
      END IF;

      RETURN jsonb_build_object('status', 'success', 'data', to_jsonb(v_row));

    WHEN 'validate' THEN
      -- Validate coupon by code
      IF coupon_data IS NULL OR NOT (coupon_data ? 'code') THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon code is required');
      END IF;

      SELECT * INTO v_row FROM global.coupons 
      WHERE code = coupon_data->>'code' 
        AND is_active = true
        AND (valid_until IS NULL OR valid_until > NOW())
        AND (usage_limit IS NULL OR usage_count < usage_limit);

      IF v_row IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Invalid or expired coupon');
      END IF;

      RETURN jsonb_build_object('status', 'success', 'data', to_jsonb(v_row));

    WHEN 'apply' THEN
      -- Apply coupon (increment usage)
      IF coupon_data IS NULL OR NOT (coupon_data ? 'code') THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Coupon code is required');
      END IF;

      UPDATE global.coupons 
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE code = coupon_data->>'code'
        AND is_active = true
        AND (valid_until IS NULL OR valid_until > NOW())
        AND (usage_limit IS NULL OR usage_count < usage_limit)
      RETURNING * INTO v_row;

      IF v_row IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Unable to apply coupon');
      END IF;

      RETURN jsonb_build_object('status', 'success', 'data', to_jsonb(v_row));

    WHEN 'stats' THEN
      -- Get coupon statistics
      WITH stats AS (
        SELECT 
          count(*) AS total_coupons,
          count(*) FILTER (WHERE is_active) AS active_coupons,
          count(*) FILTER (WHERE valid_until IS NOT NULL AND valid_until < NOW()) AS expired_coupons,
          sum(usage_count) AS total_usage,
          avg(discount_value) AS avg_discount_value
        FROM global.coupons
      ),
      top_coupons AS (
        SELECT code, usage_count
        FROM global.coupons
        WHERE usage_count > 0
        ORDER BY usage_count DESC
        LIMIT 5
      ),
      recent_coupons AS (
        SELECT code, created_at
        FROM global.coupons
        ORDER BY created_at DESC
        LIMIT 5
      )
      SELECT jsonb_build_object(
        'total_coupons', s.total_coupons,
        'active_coupons', s.active_coupons,
        'expired_coupons', s.expired_coupons,
        'total_usage', s.total_usage,
        'avg_discount_value', s.avg_discount_value,
        'top_coupons', (SELECT jsonb_agg(to_jsonb(top_coupons)) FROM top_coupons),
        'recent_coupons', (SELECT jsonb_agg(to_jsonb(recent_coupons)) FROM recent_coupons)
      ) INTO v_result FROM stats s;

      RETURN jsonb_build_object('status', 'success', 'data', v_result);
      
    ELSE
      RETURN jsonb_build_object('status', 'error', 'message', 'Unsupported action');
  END CASE;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, uuid, jsonb) TO service_role;