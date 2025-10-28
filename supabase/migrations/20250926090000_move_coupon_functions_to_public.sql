-- Migration: Enforce coupon-related functions in public schema only
-- Date: 2025-09-26
-- Purpose:
--   1. Ensure the canonical coupons table resides in public (if it was previously in a custom schema like global)
--   2. Drop any coupon-related functions that exist outside the public schema
--   3. Retain ONLY the unified public.crud_coupons function as the supported API surface
--   4. Remove legacy coupon RPC functions entirely (they are superseded by crud_coupons)
--
-- Notes:
--   - We intentionally DO NOT recreate legacy functions in public; clients must migrate to crud_coupons.
--   - This script is idempotent: conditional logic guards against errors if objects are already in desired state.
--   - If both global.coupons and public.coupons exist simultaneously, we do NOT auto-merge to avoid silent data conflicts.
--     In that scenario, manual reconciliation is required before re-running.

------------------------------
-- 1. Move coupons table to public if it only exists in global and not yet in public
------------------------------
DO $$
BEGIN
  IF to_regclass('global.coupons') IS NOT NULL
     AND to_regclass('public.coupons') IS NULL THEN
    RAISE NOTICE 'Moving table global.coupons to public schema';
    EXECUTE 'ALTER TABLE global.coupons SET SCHEMA public';
  ELSIF to_regclass('global.coupons') IS NOT NULL
        AND to_regclass('public.coupons') IS NOT NULL THEN
    RAISE WARNING 'Both global.coupons and public.coupons exist. Manual reconciliation required; no automatic move performed.';
  ELSE
    RAISE NOTICE 'No move required (public.coupons already present or global.coupons absent).';
  END IF;
END $$;

------------------------------
-- 2. Drop legacy coupon RPC functions in any schema (public or custom)
------------------------------
-- We enumerate known legacy function names; we capture all candidate signatures (no-arg or simple json/jsonb variants).

DO $$
DECLARE
  rec RECORD;
  target_names TEXT[] := ARRAY[
    'apply_coupon',
    'delete_global_coupon',
    'get_global_coupons',
    'update_global_coupon',
    'validate_coupon',
    'insert_global_coupon',
    'get_coupon_stats'
  ];
BEGIN
  FOR rec IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS arg_list
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = ANY(target_names)
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s);', rec.schema_name, rec.function_name, rec.arg_list);
    RAISE NOTICE 'Dropped function %.%(%).', rec.schema_name, rec.function_name, rec.arg_list;
  END LOOP;
END $$;

------------------------------
-- 3. Ensure unified crud_coupons exists ONLY in public schema
------------------------------
-- Drop any non-public copies (should not normally exist, but defensive)
DO $$
DECLARE rec RECORD;
BEGIN
  FOR rec IN
    SELECT n.nspname AS schema_name,
           p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS arg_list
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'crud_coupons'
      AND n.nspname <> 'public'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s);', rec.schema_name, rec.function_name, rec.arg_list);
    RAISE NOTICE 'Removed non-public copy of crud_coupons from schema %.', rec.schema_name;
  END LOOP;
END $$;

------------------------------
-- 4. (Optional) Re-grant execute on public.crud_coupons to authenticated role (idempotent)
------------------------------
DO $$
BEGIN
  IF to_regproc('public.crud_coupons(text,jsonb,jsonb,uuid,jsonb)') IS NOT NULL THEN
    GRANT EXECUTE ON FUNCTION public.crud_coupons(text, jsonb, jsonb, uuid, jsonb) TO authenticated;
  ELSE
    RAISE WARNING 'public.crud_coupons not found; ensure prior migration creating it has been applied.';
  END IF;
END $$;

------------------------------
-- 5. Verification Hints (logged as NOTICE during migration run)
------------------------------
-- After applying this migration you can run:
--   SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE p.proname ILIKE '%coupon%';
-- Expectation: Only one row: public | crud_coupons | (text, jsonb, jsonb, uuid, jsonb)
