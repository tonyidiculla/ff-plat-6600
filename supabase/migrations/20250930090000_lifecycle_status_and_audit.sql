-- Lifecycle status & audit support
-- Migration timestamp: 2025-09-30 09:00:00

-- 1. Enum / lookup for standardized statuses (if not already centralized)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_lifecycle_status') THEN
    CREATE TYPE entity_lifecycle_status AS ENUM ('active','inactive','suspended','deleted');
  END IF;
END $$;

-- 2. Ensure organization_master_l01 has a canonical status column (text -> enum cast safe)
ALTER TABLE global.organization_master_l01
  ADD COLUMN IF NOT EXISTS lifecycle_status entity_lifecycle_status;

-- Backfill lifecycle_status from existing flags
UPDATE global.organization_master_l01
SET lifecycle_status = CASE
  WHEN deleted_at IS NOT NULL THEN 'deleted'::entity_lifecycle_status
  WHEN is_active = 'suspended' THEN 'suspended'::entity_lifecycle_status -- if legacy suspended stored here
  WHEN is_active = 'inactive' THEN 'inactive'::entity_lifecycle_status
  WHEN (is_active = 'active' OR is_active = TRUE OR is_active = 't') THEN 'active'::entity_lifecycle_status
  ELSE 'inactive'::entity_lifecycle_status
END
WHERE lifecycle_status IS NULL;

-- 3. Audit table
CREATE TABLE IF NOT EXISTS global.entity_lifecycle_audit (
  audit_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id           uuid NOT NULL,
  entity_platform_id  text,
  previous_status     entity_lifecycle_status,
  new_status          entity_lifecycle_status,
  action_type         text NOT NULL, -- activate | suspend | inactivate | soft_delete
  reason              text,
  actor_user_id       uuid,
  actor_platform_id   text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_lifecycle_audit_entity ON global.entity_lifecycle_audit(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_lifecycle_audit_created ON global.entity_lifecycle_audit(created_at DESC);

-- 4. Helper: capture actor platform id (profiles assumed global.profiles)
CREATE OR REPLACE FUNCTION global._get_actor_platform_id(p_user_id uuid)
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT p.user_id::text FROM global.profiles p WHERE p.user_id = p_user_id;
$$;

-- 5. Status transition function
CREATE OR REPLACE FUNCTION global.organization_set_status(
  p_entity_id    uuid,
  p_new_status   entity_lifecycle_status,
  p_actor_id     uuid,
  p_reason       text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO global, public
AS $$
DECLARE
  v_prev entity_lifecycle_status;
  v_platform_id text;
BEGIN
  SELECT lifecycle_status, entity_platform_id INTO v_prev, v_platform_id
  FROM global.organization_master_l01
  WHERE entity_id = p_entity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entity % not found', p_entity_id USING ERRCODE = 'P0002';
  END IF;

  IF v_prev = p_new_status THEN
    RETURN true; -- no-op but successful
  END IF;

  UPDATE global.organization_master_l01
  SET lifecycle_status = p_new_status,
      updated_at = now()
  WHERE entity_id = p_entity_id;

  INSERT INTO global.entity_lifecycle_audit(
    entity_id, entity_platform_id,
    previous_status, new_status,
    action_type, reason,
    actor_user_id, actor_platform_id
  ) VALUES (
    p_entity_id, v_platform_id,
    v_prev, p_new_status,
    CASE p_new_status
      WHEN 'active' THEN 'activate'
      WHEN 'inactive' THEN 'inactivate'
      WHEN 'suspended' THEN 'suspend'
      ELSE 'status_change'
    END,
    p_reason,
    p_actor_id,
    global._get_actor_platform_id(p_actor_id)
  );

  RETURN true;
END;
$$;

-- 6. Soft delete function (marks deleted, sets lifecycle_status = deleted)
CREATE OR REPLACE FUNCTION global.organization_soft_delete(
  p_entity_id  uuid,
  p_actor_id   uuid,
  p_reason     text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO global, public
AS $$
DECLARE
  v_prev entity_lifecycle_status;
  v_platform_id text;
BEGIN
  SELECT lifecycle_status, entity_platform_id INTO v_prev, v_platform_id
  FROM global.organization_master_l01
  WHERE entity_id = p_entity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Entity % not found', p_entity_id USING ERRCODE = 'P0002';
  END IF;

  IF v_prev = 'deleted' THEN
    RETURN true; -- already deleted
  END IF;

  UPDATE global.organization_master_l01
  SET lifecycle_status = 'deleted',
      deleted_at = now(),
      deleted_by = p_actor_id,
      deletion_reason = COALESCE(p_reason, deletion_reason),
      updated_at = now()
  WHERE entity_id = p_entity_id;

  INSERT INTO global.entity_lifecycle_audit(
    entity_id, entity_platform_id,
    previous_status, new_status,
    action_type, reason,
    actor_user_id, actor_platform_id
  ) VALUES (
    p_entity_id, v_platform_id,
    v_prev, 'deleted',
    'soft_delete', p_reason,
    p_actor_id, global._get_actor_platform_id(p_actor_id)
  );

  RETURN true;
END;
$$;

-- 7. Minimal RLS (adjust as needed)
ALTER TABLE global.entity_lifecycle_audit ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'global' 
      AND tablename = 'entity_lifecycle_audit' 
      AND policyname = 'select_platform_admin'
  ) THEN
    CREATE POLICY select_platform_admin ON global.entity_lifecycle_audit
      FOR SELECT USING (true); -- TODO tighten to platform admin role
  END IF;
END $$;

-- 8. Grant execute on functions to authenticated (adjust to platform admin role later)
GRANT EXECUTE ON FUNCTION global.organization_set_status(uuid, entity_lifecycle_status, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION global.organization_soft_delete(uuid, uuid, text) TO authenticated;

-- 9. Convenience view for frontend (optional)
CREATE OR REPLACE VIEW global.entity_lifecycle_view AS
SELECT 
  e.entity_id,
  e.entity_platform_id,
  e.entity_name,
  e.entity_type,
  e.lifecycle_status,
  e.deleted_at,
  e.deletion_reason,
  e.updated_at,
  e.created_at
FROM global.organization_master_l01 e;

-- 10. Comment markers
COMMENT ON FUNCTION global.organization_set_status IS 'Set lifecycle_status for entity and log audit row';
COMMENT ON FUNCTION global.organization_soft_delete IS 'Soft delete entity: mark deleted_at, set lifecycle_status=deleted, audit row';
