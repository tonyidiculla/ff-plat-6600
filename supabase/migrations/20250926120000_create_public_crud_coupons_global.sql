-- Migration: Create/Replace public.crud_coupons for global.coupons
-- Date: 2025-09-26
-- Purpose: Provide a single SECURITY DEFINER RPC function (public.crud_coupons)
--          that performs CRUD operations over every column of the global.coupons table.
--          (No additional helper functions created in other schemas.)
--
-- Assumptions:
--   * Table global.coupons already exists with (a superset of) the columns referenced below.
--   * Calling clients pass JSONB payloads; absent fields are ignored on update.
--   * Returned shape always JSONB with status + action + data or error info.
--
-- If your actual column list differs, adjust the INSERT and UPDATE lists accordingly before applying.
--
-- Columns covered (expected):
--   id (uuid, PK, default gen_random_uuid())
--   code (text)
--   description (text)
--   campaign_name (text)
--   discount_type (text: 'percentage' | 'fixed_amount')
--   discount_value (numeric)
--   currency (text)
--   valid_from (timestamptz)
--   valid_until (timestamptz, nullable)
--   usage_limit (integer, nullable)
--   usage_count (integer default 0)
--   is_active (boolean)
--   coupon_type (text)
--   applicable_solution_types (text[])
--   partner_id (uuid, nullable)
--   target_user_id (uuid, nullable)
--   minimum_order_value (numeric, nullable)
--   maximum_discount_amount (numeric, nullable)
--   first_time_user_only (boolean)
--   stackable (boolean)
--   auto_apply_rules (jsonb, nullable)
--   referral_tracking (jsonb, nullable)
--   created_by (uuid, nullable)
--   created_at (timestamptz)
--   updated_at (timestamptz)
--
-- Action verbs implemented: create | read | get | update | delete

DROP FUNCTION IF EXISTS public.crud_coupons(text, jsonb, jsonb, uuid, jsonb);

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
SET search_path = public, global
AS $$
DECLARE
  v_now timestamptz := now();
  v_row global.coupons%ROWTYPE;
  v_rows jsonb;
  v_limit int;
  v_offset int;
  v_total bigint;
BEGIN
  IF action NOT IN ('create','read','get','update','delete') THEN
    RETURN jsonb_build_object('status','error','error','unsupported_action');
  END IF;

  ------------------------------------------------------------------
  -- CREATE
  ------------------------------------------------------------------
  IF action = 'create' THEN
    IF coalesce(coupon_data->>'code','') = '' THEN
      RETURN jsonb_build_object('status','error','error','missing_code');
    END IF;
    IF coalesce(coupon_data->>'discount_type','') NOT IN ('percentage','fixed_amount') THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_type');
    END IF;
    IF (coupon_data->>'discount_value') IS NULL OR (coupon_data->>'discount_value')::numeric <= 0 THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_value');
    END IF;

    INSERT INTO global.coupons (
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
    ) VALUES (
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
        ELSE ARRAY[]::text[] END,
      NULLIF(coupon_data->>'partner_id','')::uuid,
      NULLIF(coupon_data->>'target_user_id','')::uuid,
      NULLIF(coupon_data->>'minimum_order_value','')::numeric,
      NULLIF(coupon_data->>'maximum_discount_amount','')::numeric,
      COALESCE((coupon_data->>'first_time_user_only')::boolean,false),
      COALESCE((coupon_data->>'stackable')::boolean,false),
      CASE WHEN jsonb_typeof(coupon_data->'auto_apply_rules') IN ('object','array') THEN coupon_data->'auto_apply_rules' END,
      CASE WHEN jsonb_typeof(coupon_data->'referral_tracking') IN ('object','array') THEN coupon_data->'referral_tracking' END,
      NULLIF(coupon_data->>'created_by','')::uuid,
      v_now,
      v_now
    ) RETURNING * INTO v_row;

    RETURN jsonb_build_object('status','success','action','create','data', to_jsonb(v_row));
  END IF;

  ------------------------------------------------------------------
  -- READ (list)
  ------------------------------------------------------------------
  IF action = 'read' THEN
    v_limit  := COALESCE((options->>'limit')::int, 50);
    v_offset := COALESCE((options->>'offset')::int, 0);

    WITH base AS (
      SELECT * FROM global.coupons
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
      'status','success','action','read',
      'total', v_total,
      'limit', v_limit,
      'offset', v_offset,
      'data', COALESCE(v_rows,'[]'::jsonb)
    );
  END IF;

  ------------------------------------------------------------------
  -- GET single
  ------------------------------------------------------------------
  IF action = 'get' THEN
    IF p_coupon_id IS NULL THEN
      RETURN jsonb_build_object('status','error','error','missing_coupon_id');
    END IF;
    SELECT * INTO v_row FROM global.coupons WHERE id = p_coupon_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('status','error','error','not_found');
    END IF;
    RETURN jsonb_build_object('status','success','action','get','data', to_jsonb(v_row));
  END IF;

  ------------------------------------------------------------------
  -- UPDATE
  ------------------------------------------------------------------
  IF action = 'update' THEN
    IF p_coupon_id IS NULL THEN
      RETURN jsonb_build_object('status','error','error','missing_coupon_id');
    END IF;
    SELECT * INTO v_row FROM global.coupons WHERE id = p_coupon_id FOR UPDATE;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('status','error','error','not_found');
    END IF;
    IF coupon_data ? 'discount_type' AND coupon_data->>'discount_type' NOT IN ('percentage','fixed_amount') THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_type');
    END IF;
    IF coupon_data ? 'discount_value' AND (coupon_data->>'discount_value')::numeric <= 0 THEN
      RETURN jsonb_build_object('status','error','error','invalid_discount_value');
    END IF;

    UPDATE global.coupons SET
      code                     = COALESCE(coupon_data->>'code', code),
      description              = COALESCE(coupon_data->>'description', description),
      campaign_name            = COALESCE(coupon_data->>'campaign_name', campaign_name),
      discount_type            = COALESCE(coupon_data->>'discount_type', discount_type),
      discount_value           = COALESCE(NULLIF(coupon_data->>'discount_value','')::numeric, discount_value),
      currency                 = COALESCE(coupon_data->>'currency', currency),
      valid_from               = COALESCE((coupon_data->>'valid_from')::timestamptz, valid_from),
      valid_until              = CASE WHEN coupon_data ? 'valid_until' THEN NULLIF(coupon_data->>'valid_until','')::timestamptz ELSE valid_until END,
      usage_limit              = CASE WHEN coupon_data ? 'usage_limit' THEN NULLIF(coupon_data->>'usage_limit','')::int ELSE usage_limit END,
      usage_count              = CASE WHEN coupon_data ? 'usage_count' THEN NULLIF(coupon_data->>'usage_count','')::int ELSE usage_count END,
      is_active                = COALESCE((coupon_data->>'is_active')::boolean, is_active),
      coupon_type              = COALESCE(coupon_data->>'coupon_type', coupon_type),
      applicable_solution_types = CASE WHEN coupon_data ? 'applicable_solution_types' THEN (
          CASE WHEN jsonb_typeof(coupon_data->'applicable_solution_types')='array'
               THEN (SELECT array_agg(value::text) FROM jsonb_array_elements(coupon_data->'applicable_solution_types'))
               ELSE string_to_array(coupon_data->>'applicable_solution_types',',') END
        ) ELSE applicable_solution_types END,
      partner_id               = CASE WHEN coupon_data ? 'partner_id' THEN NULLIF(coupon_data->>'partner_id','')::uuid ELSE partner_id END,
      target_user_id           = CASE WHEN coupon_data ? 'target_user_id' THEN NULLIF(coupon_data->>'target_user_id','')::uuid ELSE target_user_id END,
      minimum_order_value      = CASE WHEN coupon_data ? 'minimum_order_value' THEN NULLIF(coupon_data->>'minimum_order_value','')::numeric ELSE minimum_order_value END,
      maximum_discount_amount  = CASE WHEN coupon_data ? 'maximum_discount_amount' THEN NULLIF(coupon_data->>'maximum_discount_amount','')::numeric ELSE maximum_discount_amount END,
      first_time_user_only     = COALESCE((coupon_data->>'first_time_user_only')::boolean, first_time_user_only),
      stackable                = COALESCE((coupon_data->>'stackable')::boolean, stackable),
      auto_apply_rules         = CASE WHEN coupon_data ? 'auto_apply_rules' THEN coupon_data->'auto_apply_rules' ELSE auto_apply_rules END,
      referral_tracking        = CASE WHEN coupon_data ? 'referral_tracking' THEN coupon_data->'referral_tracking' ELSE referral_tracking END,
      updated_at               = v_now
    WHERE id = p_coupon_id
    RETURNING * INTO v_row;

    RETURN jsonb_build_object('status','success','action','update','data', to_jsonb(v_row));
  END IF;

  ------------------------------------------------------------------
  -- DELETE
  ------------------------------------------------------------------
  IF action = 'delete' THEN
    IF p_coupon_id IS NULL THEN
      RETURN jsonb_build_object('status','error','error','missing_coupon_id');
    END IF;
    DELETE FROM global.coupons WHERE id = p_coupon_id RETURNING * INTO v_row;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('status','error','error','not_found');
    END IF;
    RETURN jsonb_build_object('status','success','action','delete','data', to_jsonb(v_row));
  END IF;

  RETURN jsonb_build_object('status','error','error','unhandled');
END;
$$;

-- Permissions (adjust as needed). Usually grant to authenticated / service roles only.
REVOKE ALL ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) TO service_role;

-- Verification examples (run after apply):
-- SELECT public.crud_coupons('read', '{}', '{}', NULL, '{"limit":5}');
-- SELECT public.crud_coupons('create', '{}', '{"code":"TEST10","discount_type":"percentage","discount_value":10}');
-- SELECT public.crud_coupons('stats'); -- will return unsupported_action (not implemented here)
