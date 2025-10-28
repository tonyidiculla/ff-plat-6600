import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[ERROR] Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllFunctions() {
  console.log('[search] Finding all functions in Supabase database...\n');
  
  // Method 1: Try to query information_schema directly
  console.log('[clipboard] Method 1: Querying information_schema.routines...');
  try {
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_schema, routine_type, data_type')
      .eq('routine_schema', 'public')
      .order('routine_name');
    
    if (error) {
      console.log('[ERROR] Cannot access information_schema directly:', error.message);
    } else {
      console.log('[OK] Found functions via information_schema:');
      data.forEach(func => {
        console.log(`   [box] ${func.routine_name} (${func.routine_type}) -> ${func.data_type}`);
      });
      return;
    }
  } catch (err) {
    console.log('[ERROR] information_schema access failed:', err.message);
  }
  
  // Method 2: Try using a custom SQL query through RPC (if available)
  console.log('\n[clipboard] Method 2: Trying custom SQL query...');
  try {
    const sqlQuery = `
      SELECT 
        routine_name,
        routine_schema,
        routine_type,
        data_type as return_type,
        routine_definition
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlQuery
    });
    
    if (error) {
      console.log('[ERROR] exec_sql not available:', error.message);
    } else {
      console.log('[OK] Found functions via exec_sql:');
      if (data && data.length > 0) {
        data.forEach(func => {
          console.log(`   [box] ${func.routine_name} (${func.routine_type}) -> ${func.return_type}`);
        });
        return;
      } else {
        console.log('[ERROR] No data returned from exec_sql');
      }
    }
  } catch (err) {
    console.log('[ERROR] Custom SQL query failed:', err.message);
  }
  
  // Method 3: Test known functions from our TypeScript types
  console.log('\n[clipboard] Method 3: Testing functions from TypeScript types...');
  
  // Get function names from our types file - these are the ones we know about
  const knownFunctions = [
    'append_to_soap_note',
    'assign_role_to_hospital',
    'assign_role_to_user',
    'can_access_entity',
    'check_platform_admin',
    'create_hospital_l02',
    'create_module',
    'delete_entities',
    'generate_platform_id',
    'get_accessible_entities',
    'get_auth_user_id',
    'get_current_user_id',
    'get_entity_details',
    'get_global_organizations',
    'insert_global_organization_entity',
    'update_global_organization_entity',
    // Coupon functions (these might be removed)
    'apply_coupon',
    'delete_global_coupon',
    'get_global_coupons',
    'insert_global_coupon',
    'update_global_coupon',
    'validate_coupon',
    'get_coupon_stats',
    // New unified function
    'crud_coupons'
  ];
  
  const existingFunctions = [];
  const nonExistingFunctions = [];
  
  for (const funcName of knownFunctions) {
    try {
      const { error } = await supabase.rpc(funcName);
      
      if (error) {
        if (error.message.includes('does not exist')) {
          nonExistingFunctions.push(funcName);
        } else {
          // Function exists but needs parameters or has other issues
          existingFunctions.push({
            name: funcName,
            status: 'exists',
            note: error.message
          });
        }
      } else {
        // Function exists and executed successfully
        existingFunctions.push({
          name: funcName,
          status: 'callable',
          note: 'Function executed without error'
        });
      }
    } catch (err) {
      existingFunctions.push({
        name: funcName,
        status: 'unknown',
        note: err.message
      });
    }
  }
  
  console.log('[OK] Functions that exist:');
  existingFunctions.forEach(func => {
    const icon = func.status === 'callable' ? '[green]' : '[yellow]';
    console.log(`   ${icon} ${func.name} - ${func.status}`);
    if (func.note && !func.note.includes('schema cache')) {
      console.log(`      [chat] ${func.note.substring(0, 80)}...`);
    }
  });
  
  console.log('\n[ERROR] Functions that do not exist:');
  nonExistingFunctions.forEach(func => {
    console.log(`   [red] ${func}`);
  });
  
  // Method 4: Alternative PostgreSQL query approach
  console.log('\n[clipboard] Method 4: Alternative approach - PostgreSQL system catalogs...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          p.proname as function_name,
          n.nspname as schema_name,
          pg_get_function_result(p.oid) as return_type,
          pg_get_function_arguments(p.oid) as arguments
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
        ORDER BY p.proname;
      `
    });
    
    if (error) {
      console.log('[ERROR] PostgreSQL catalog query failed:', error.message);
    } else if (data && data.length > 0) {
      console.log('[OK] Functions found via PostgreSQL catalogs:');
      data.forEach(func => {
        console.log(`   [box] ${func.function_name}(${func.arguments}) -> ${func.return_type}`);
      });
    }
  } catch (err) {
    console.log('[ERROR] PostgreSQL catalog approach failed:', err.message);
  }
}

// Method 5: Manual instructions for Supabase Dashboard
function showDashboardInstructions() {
  console.log('\n[global] Method 5: Manual approach via Supabase Dashboard:');
  console.log('');
  console.log('1. [link] Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. [folder] Select your project');
  console.log('3. [tools]  Navigate to "SQL Editor"');
  console.log('4. [note] Run this query:');
  console.log('');
  console.log('   SELECT ');
  console.log('     routine_name,');
  console.log('     routine_type,');
  console.log('     data_type as return_type,');
  console.log('     routine_definition');
  console.log('   FROM information_schema.routines ');
  console.log('   WHERE routine_schema = \'public\'');
  console.log('   ORDER BY routine_name;');
  console.log('');
  console.log('5. [OK] This will show you ALL functions in your public schema');
  console.log('');
  console.log('[clipboard] Alternative query for just function names:');
  console.log('');
  console.log('   SELECT routine_name FROM information_schema.routines');
  console.log('   WHERE routine_schema = \'public\'');
  console.log('   ORDER BY routine_name;');
}

async function main() {
  await listAllFunctions();
  showDashboardInstructions();
  
  console.log('\n[chart] Summary:');
  console.log('The most reliable way to see ALL functions is through the Supabase Dashboard SQL Editor.');
  console.log('The RPC interface has limitations for querying system information.');
}

main().catch(console.error);