-- Migration: Create public.crud_coupons function
-- Date: 2025-09-26
-- Purpose: Unified CRUD function for coupon operations

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.crud_coupons(text, jsonb, jsonb, uuid, jsonb);

-- Create the unified CRUD function
CREATE OR REPLACE FUNCTION public.crud_coupons(
  action       text,
  filters      jsonb DEFAULT '{}'::jsonb,
  coupon_data  jsonb DEFAULT '{}'::jsonb,
  p_coupon_id  uuid  DEFAULT NULL,
  options      jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_row record;
  v_rows jsonb;
  v_limit int;
  v_offset int;
  v_total bigint;
BEGIN
  -- Validate action parameter
  IF action NOT IN ('create','read','get','update','delete','validate','apply','stats') THEN
    RETURN jsonb_build_object('status','error','error','unsupported_action','message',format('Action "%s" not supported',action));
  END IF;

  --------------------------------------------------------------------
  -- CREATE
  --------------------------------------------------------------------
  IF action = 'create' THEN
    -- Validate required fields
    IF coalesce(coupon_data->>'code','') = '' THEN
      RETURN jsonb_build_object('status','error','error','missing_code','message','Coupon code is required');
    END IF;
    IF coalesce(coupon_data->>'discount_type','') NOT IN ('percentage','fixed_amount') THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_type','message','discount_type must be "percentage" or "fixed_amount"');
    END IF;
    IF (coupon_data->>'discount_value') IS NULL OR (coupon_data->>'discount_value')::numeric <= 0 THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_value','message','discount_value must be greater than 0');
    END IF;

    -- Check if coupon code already exists
    IF EXISTS (SELECT 1 FROM coupons WHERE code = coupon_data->>'code') THEN
      RETURN jsonb_build_object('status','error','error','duplicate_code','message','Coupon code already exists');
    END IF;

    INSERT INTO coupons (
      code,
      description,
      campaign_name,
      discount_type,
      discount_value,
      currency,
      valid_from,
      valid_until,
      usage_limit,
      usage_count,
      is_active,
      coupon_type,
      applicable_solution_types,
      partner_id,
      target_user_id,
      minimum_order_value,
      maximum_discount_amount,
      first_time_user_only,
      stackable,
      auto_apply_rules,
      referral_tracking,
      created_by,
      created_at,
      updated_at
    )
    VALUES (
      coupon_data->>'code',
      coupon_data->>'description',
      coupon_data->>'campaign_name',
      coupon_data->>'discount_type',
      (coupon_data->>'discount_value')::numeric,
      coalesce(coupon_data->>'currency','USD'),
      COALESCE((coupon_data->>'valid_from')::timestamptz, v_now),
      (coupon_data->>'valid_until')::timestamptz,
      NULLIF(coupon_data->>'usage_limit','')::int,
      COALESCE(NULLIF(coupon_data->>'usage_count','')::int,0),
      COALESCE((coupon_data->>'is_active')::boolean,true),
      coupon_data->>'coupon_type',
      CASE
        WHEN jsonb_typeof(coupon_data->'applicable_solution_types')='array'
          THEN (SELECT array_agg(value::text) FROM jsonb_array_elements(coupon_data->'applicable_solution_types'))
        WHEN coalesce(coupon_data->>'applicable_solution_types','') <> ''
          THEN string_to_array(coupon_data->>'applicable_solution_types',',')
        ELSE ARRAY[]::text[]
      END,
      NULLIF(coupon_data->>'partner_id','')::uuid,
      NULLIF(coupon_data->>'target_user_id','')::uuid,
      NULLIF(coupon_data->>'minimum_order_value','')::numeric,
      NULLIF(coupon_data->>'maximum_discount_amount','')::numeric,
      COALESCE((coupon_data->>'first_time_user_only')::boolean,false),
      COALESCE((coupon_data->>'stackable')::boolean,false),
      CASE WHEN jsonb_typeof(coupon_data->'auto_apply_rules') IN ('object','array')
           THEN coupon_data->'auto_apply_rules' END,
      CASE WHEN jsonb_typeof(coupon_data->'referral_tracking') IN ('object','array')
           THEN coupon_data->'referral_tracking' END,
      NULLIF(coupon_data->>'created_by','')::uuid,
      v_now,
      v_now
    )
    RETURNING * INTO v_row;

    RETURN jsonb_build_object('status','success','action','create','data', to_jsonb(v_row));
  END IF;

  --------------------------------------------------------------------
  -- READ (list with filtering and pagination)
  --------------------------------------------------------------------
  IF action = 'read' THEN
    v_limit  := COALESCE((options->>'limit')::int, 50);
    v_offset := COALESCE((options->>'offset')::int, 0);

    WITH base AS (
      SELECT * FROM coupons
      WHERE (filters ? 'code' IS NOT TRUE OR code ILIKE '%'||(filters->>'code')||'%')
        AND (filters ? 'is_active' IS NOT TRUE OR is_active = (filters->>'is_active')::boolean)
        AND (filters ? 'coupon_type' IS NOT TRUE OR coupon_type = filters->>'coupon_type')
        AND (filters ? 'campaign_name' IS NOT TRUE OR campaign_name ILIKE '%'||(filters->>'campaign_name')||'%')
        AND (filters ? 'valid_on' IS NOT TRUE OR (
             valid_from <= (filters->>'valid_on')::timestamptz
             AND (valid_until IS NULL OR valid_until >= (filters->>'valid_on')::timestamptz)
        ))
    ), counted AS (
      SELECT (SELECT count(*) FROM base) AS total_count,
             (SELECT jsonb_agg(to_jsonb(b.*) ORDER BY b.created_at DESC)
              FROM (SELECT * FROM base ORDER BY created_at DESC LIMIT v_limit OFFSET v_offset) b) AS payload
    )
    SELECT total_count, payload INTO v_total, v_rows FROM counted;

    RETURN jsonb_build_object(
      'status','success',
      'action','read',
      'total', v_total,
      'limit', v_limit,
      'offset', v_offset,
      'data', COALESCE(v_rows,'[]'::jsonb)
    );
  END IF;

  --------------------------------------------------------------------
  -- GET single coupon by ID
  --------------------------------------------------------------------
  IF action = 'get' THEN
    IF p_coupon_id IS NULL THEN
      RETURN jsonb_build_object('status','error','error','missing_coupon_id','message','Coupon ID is required');
    END IF;

    SELECT * INTO v_row FROM coupons WHERE id = p_coupon_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('status','error','error','not_found','message','Coupon not found');
    END IF;

    RETURN jsonb_build_object('status','success','action','get','data', to_jsonb(v_row));
  END IF;

  --------------------------------------------------------------------
  -- UPDATE existing coupon
  --------------------------------------------------------------------
  IF action = 'update' THEN
    IF p_coupon_id IS NULL THEN
      RETURN jsonb_build_object('status','error','error','missing_coupon_id','message','Coupon ID is required');
    END IF;

    -- Lock the row for update
    SELECT * INTO v_row FROM coupons WHERE id = p_coupon_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('status','error','error','not_found','message','Coupon not found');
    END IF;

    -- Validate fields if being updated
    IF coupon_data ? 'discount_type'
       AND coupon_data->>'discount_type' NOT IN ('percentage','fixed_amount') THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_type','message','discount_type must be "percentage" or "fixed_amount"');
    END IF;
    IF coupon_data ? 'discount_value'
       AND (coupon_data->>'discount_value')::numeric <= 0 THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_value','message','discount_value must be greater than 0');
    END IF;

    -- Check for duplicate code if code is being updated
    IF coupon_data ? 'code' AND coupon_data->>'code' <> v_row.code THEN
      IF EXISTS (SELECT 1 FROM coupons WHERE code = coupon_data->>'code' AND id <> p_coupon_id) THEN
        RETURN jsonb_build_object('status','error','error','duplicate_code','message','Coupon code already exists');
      END IF;
    END IF;

    UPDATE coupons SET
      code                      = COALESCE(coupon_data->>'code', code),
      description               = COALESCE(coupon_data->>'description', description),
      campaign_name             = COALESCE(coupon_data->>'campaign_name', campaign_name),
      discount_type             = COALESCE(coupon_data->>'discount_type', discount_type),
      discount_value            = COALESCE(NULLIF(coupon_data->>'discount_value','')::numeric, discount_value),
      currency                  = COALESCE(coupon_data->>'currency', currency),
      valid_from                = COALESCE((coupon_data->>'valid_from')::timestamptz, valid_from),
      valid_until               = CASE WHEN coupon_data ? 'valid_until'
                                       THEN NULLIF(coupon_data->>'valid_until','')::timestamptz
                                       ELSE valid_until END,
      usage_limit               = CASE WHEN coupon_data ? 'usage_limit'
                                       THEN NULLIF(coupon_data->>'usage_limit','')::int
                                       ELSE usage_limit END,
      usage_count               = CASE WHEN coupon_data ? 'usage_count'
                                       THEN NULLIF(coupon_data->>'usage_count','')::int
                                       ELSE usage_count END,
      is_active                 = COALESCE((coupon_data->>'is_active')::boolean, is_active),
      coupon_type               = COALESCE(coupon_data->>'coupon_type', coupon_type),
      applicable_solution_types = CASE WHEN coupon_data ? 'applicable_solution_types' THEN (
          CASE WHEN jsonb_typeof(coupon_data->'applicable_solution_types')='array'
               THEN (SELECT array_agg(value::text) FROM jsonb_array_elements(coupon_data->'applicable_solution_types'))
               ELSE string_to_array(coupon_data->>'applicable_solution_types',',') END
        ) ELSE applicable_solution_types END,
      partner_id                = CASE WHEN coupon_data ? 'partner_id'
                                       THEN NULLIF(coupon_data->>'partner_id','')::uuid
                                       ELSE partner_id END,
      target_user_id            = CASE WHEN coupon_data ? 'target_user_id'
                                       THEN NULLIF(coupon_data->>'target_user_id','')::uuid
                                       ELSE target_user_id END,
      minimum_order_value       = CASE WHEN coupon_data ? 'minimum_order_value'
                                       THEN NULLIF(coupon_data->>'minimum_order_value','')::numeric
                                       ELSE minimum_order_value END,
      maximum_discount_amount   = CASE WHEN coupon_data ? 'maximum_discount_amount'
                                       THEN NULLIF(coupon_data->>'maximum_discount_amount','')::numeric
                                       ELSE maximum_discount_amount END,
      first_time_user_only      = COALESCE((coupon_data->>'first_time_user_only')::boolean, first_time_user_only),
      stackable                 = COALESCE((coupon_data->>'stackable')::boolean, stackable),
      auto_apply_rules          = CASE WHEN coupon_data ? 'auto_apply_rules'
                                       THEN coupon_data->'auto_apply_rules'
                                       ELSE auto_apply_rules END,
      referral_tracking         = CASE WHEN coupon_data ? 'referral_tracking'
                                       THEN coupon_data->'referral_tracking'
                                       ELSE referral_tracking END,
      updated_at                = v_now
    WHERE id = p_coupon_id
    RETURNING * INTO v_row;

    RETURN jsonb_build_object('status','success','action','update','data', to_jsonb(v_row));
  END IF;

  --------------------------------------------------------------------
  -- DELETE coupon
  --------------------------------------------------------------------
  IF action = 'delete' THEN
    IF p_coupon_id IS NULL THEN
      RETURN jsonb_build_object('status','error','error','missing_coupon_id','message','Coupon ID is required');
    END IF;

    DELETE FROM coupons WHERE id = p_coupon_id RETURNING * INTO v_row;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('status','error','error','not_found','message','Coupon not found');
    END IF;

    RETURN jsonb_build_object('status','success','action','delete','data', to_jsonb(v_row));
  END IF;

  --------------------------------------------------------------------
  -- VALIDATE coupon (check if valid for use)
  --------------------------------------------------------------------
  IF action = 'validate' THEN
    DECLARE
      v_code text := trim(both from (coupon_data->>'code'));
      v_order_amount numeric := COALESCE(NULLIF(coupon_data->>'order_amount','')::numeric,0);
      v_currency text := COALESCE(coupon_data->>'currency','USD');
    BEGIN
      IF v_code IS NULL OR v_code = '' THEN
        RETURN jsonb_build_object('status','error','error','missing_code','message','Coupon code is required');
      END IF;

      SELECT * INTO v_row
      FROM coupons
      WHERE code = v_code
        AND is_active = true
        AND (valid_from <= v_now)
        AND (valid_until IS NULL OR valid_until >= v_now);

      IF NOT FOUND THEN
        RETURN jsonb_build_object('status','success','action','validate','valid',false,'reason','invalid_or_expired');
      END IF;

      -- Check usage limit
      IF v_row.usage_limit IS NOT NULL AND v_row.usage_count >= v_row.usage_limit THEN
        RETURN jsonb_build_object('status','success','action','validate','valid',false,'reason','usage_limit_exceeded');
      END IF;

      -- Check minimum order value
      IF v_row.minimum_order_value IS NOT NULL AND v_order_amount < v_row.minimum_order_value THEN
        RETURN jsonb_build_object('status','success','action','validate','valid',false,'reason','minimum_order_not_met');
      END IF;

      -- Check currency match
      IF v_row.currency <> v_currency THEN
        RETURN jsonb_build_object('status','success','action','validate','valid',false,'reason','currency_mismatch');
      END IF;

      RETURN jsonb_build_object(
        'status','success',
        'action','validate',
        'valid', true,
        'coupon', to_jsonb(v_row)
      );
    END;
  END IF;

  --------------------------------------------------------------------
  -- APPLY coupon (increment usage count and calculate discount)
  --------------------------------------------------------------------
  IF action = 'apply' THEN
    DECLARE
      v_code text := trim(both from (coupon_data->>'code'));
      v_order_amount numeric := COALESCE(NULLIF(coupon_data->>'order_amount','')::numeric,0);
      v_currency text := COALESCE(coupon_data->>'currency','USD');
      v_discount_amount numeric;
    BEGIN
      IF v_code IS NULL OR v_code = '' THEN
        RETURN jsonb_build_object('status','error','error','missing_code','message','Coupon code is required');
      END IF;

      -- Lock and validate the coupon
      SELECT * INTO v_row
      FROM coupons
      WHERE code = v_code
        AND is_active = true
        AND (valid_from <= v_now)
        AND (valid_until IS NULL OR valid_until >= v_now)
      FOR UPDATE;

      IF NOT FOUND THEN
        RETURN jsonb_build_object('status','error','error','invalid_coupon','message','Invalid or expired coupon');
      END IF;

      -- Check usage limit
      IF v_row.usage_limit IS NOT NULL AND v_row.usage_count >= v_row.usage_limit THEN
        RETURN jsonb_build_object('status','error','error','usage_limit_exceeded','message','Coupon usage limit exceeded');
      END IF;

      -- Check minimum order value
      IF v_row.minimum_order_value IS NOT NULL AND v_order_amount < v_row.minimum_order_value THEN
        RETURN jsonb_build_object('status','error','error','minimum_order_not_met','message','Order amount below minimum required');
      END IF;

      -- Check currency match
      IF v_row.currency <> v_currency THEN
        RETURN jsonb_build_object('status','error','error','currency_mismatch','message','Currency mismatch');
      END IF;

      -- Calculate discount amount
      IF v_row.discount_type = 'percentage' THEN
        v_discount_amount := round(v_order_amount * (v_row.discount_value / 100.0), 2);
        IF v_row.maximum_discount_amount IS NOT NULL AND v_discount_amount > v_row.maximum_discount_amount THEN
          v_discount_amount := v_row.maximum_discount_amount;
        END IF;
      ELSE -- fixed_amount
        v_discount_amount := v_row.discount_value;
        IF v_row.maximum_discount_amount IS NOT NULL AND v_discount_amount > v_row.maximum_discount_amount THEN
          v_discount_amount := v_row.maximum_discount_amount;
        END IF;
      END IF;

      -- Ensure discount doesn't exceed order amount
      IF v_discount_amount > v_order_amount THEN
        v_discount_amount := v_order_amount;
      END IF;

      -- Increment usage count
      UPDATE coupons
      SET usage_count = usage_count + 1,
          updated_at = v_now
      WHERE id = v_row.id
      RETURNING * INTO v_row;

      RETURN jsonb_build_object(
        'status','success',
        'action','apply',
        'discount_applied', v_discount_amount,
        'final_amount', GREATEST(v_order_amount - v_discount_amount, 0),
        'coupon', to_jsonb(v_row)
      );
    END;
  END IF;

  --------------------------------------------------------------------
  -- STATS (get coupon statistics)
  --------------------------------------------------------------------
  IF action = 'stats' THEN
    WITH stats AS (
      SELECT
        count(*) AS total_coupons,
        count(*) FILTER (WHERE is_active) AS active_coupons,
        count(*) FILTER (WHERE usage_limit IS NOT NULL) AS with_usage_limit,
        sum(usage_count) AS total_usage,
        avg(discount_value) AS avg_discount_value
      FROM coupons
    ),
    by_type AS (
      SELECT jsonb_object_agg(coupon_type, cnt) AS type_distribution
      FROM (
        SELECT coupon_type, count(*) as cnt
        FROM coupons
        WHERE coupon_type IS NOT NULL
        GROUP BY coupon_type
      ) t
    ),
    by_discount_type AS (
      SELECT jsonb_object_agg(discount_type, cnt) AS discount_type_distribution
      FROM (
        SELECT discount_type, count(*) as cnt
        FROM coupons
        GROUP BY discount_type
      ) d
    )
    SELECT jsonb_build_object(
      'total_coupons', s.total_coupons,
      'active_coupons', s.active_coupons,
      'with_usage_limit', s.with_usage_limit,
      'total_usage', s.total_usage,
      'avg_discount_value', round(s.avg_discount_value, 2),
      'by_type', COALESCE(bt.type_distribution, '{}'::jsonb),
      'by_discount_type', COALESCE(bdt.discount_type_distribution, '{}'::jsonb)
    ) INTO v_rows
    FROM stats s, by_type bt, by_discount_type bdt;

    RETURN jsonb_build_object(
      'status','success',
      'action','stats',
      'data', v_rows
    );
  END IF;

  -- Should never reach here
  RETURN jsonb_build_object('status','error','error','unhandled','message','Unhandled action');
END;
$$;

-- Set permissions
REVOKE ALL ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) TO service_role;

-- Add some helpful comments
COMMENT ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) IS 'Unified CRUD function for coupon operations. Supports actions: create, read, get, update, delete, validate, apply, stats';