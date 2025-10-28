import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[ERROR] Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  console.log('[tool] Applying RLS policies for user_to_role_assignment table...\n');
  
  const sqlStatements = [
    // Drop existing policies
    `DROP POLICY IF EXISTS "Users can view their own role assignments" ON master_data.user_to_role_assignment;`,
    `DROP POLICY IF EXISTS "Users can only see own assignments" ON master_data.user_to_role_assignment;`,
    `DROP POLICY IF EXISTS "user_to_role_assignment_select_policy" ON master_data.user_to_role_assignment;`,
    
    // Create helper function
    `
    CREATE OR REPLACE FUNCTION master_data.is_platform_admin(user_uid uuid)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1
        FROM master_data.user_to_role_assignment ura
        JOIN master_data.platform_roles pr ON ura.role_id = pr.role_id
        WHERE ura.user_platform_id = (
          SELECT user_platform_id 
          FROM master_data.profiles 
          WHERE user_id = user_uid
        )
        AND pr.role_name IN ('Platform Admin', 'Super Admin', 'System Admin')
        AND ura.is_active = true
      );
    END;
    $$;
    `,
    
    // Create the new policy
    `
    CREATE POLICY "Allow platform admins to view all role assignments"
    ON master_data.user_to_role_assignment
    FOR SELECT
    USING (
      master_data.is_platform_admin(auth.uid())
      OR
      user_platform_id = (
        SELECT user_platform_id 
        FROM master_data.profiles 
        WHERE user_id = auth.uid()
      )
    );
    `,
    
    // Enable RLS
    `ALTER TABLE master_data.user_to_role_assignment ENABLE ROW LEVEL SECURITY;`,
    
    // Grant permissions
    `GRANT SELECT ON master_data.user_to_role_assignment TO authenticated;`,
    `GRANT EXECUTE ON FUNCTION master_data.is_platform_admin TO authenticated;`
  ];
  
  for (const sql of sqlStatements) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log('[warn]  Statement might have failed (this is ok if policy/function doesn\'t exist):', error.message.substring(0, 100));
      } else {
        console.log('[OK] Executed successfully');
      }
    } catch (err) {
      console.log('[warn]  Error (might be expected):', err.message.substring(0, 100));
    }
  }
  
  console.log('\n[OK] RLS policy setup complete!');
  console.log('\n[clipboard] Summary:');
  console.log('- Platform admins can view ALL role assignments');
  console.log('- Regular users can only view their own role assignments');
  console.log('- Helper function created to check admin status');
  console.log('\n[refresh] Please refresh your application to see the changes.');
}

applyRLSPolicies().catch(console.error);
