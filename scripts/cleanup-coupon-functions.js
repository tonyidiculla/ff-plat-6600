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

async function cleanupOldCouponFunctions() {
  console.log('[broom] Cleaning up old coupon functions...\n');
  
  const functionsToRemove = [
    'apply_coupon',
    'delete_global_coupon', 
    'get_global_coupons',
    'update_global_coupon',
    'validate_coupon'
  ];

  console.log('[search] First, let\'s verify which functions exist:');
  
  // Check which functions exist
  const existingFunctions = [];
  for (const funcName of functionsToRemove) {
    try {
      const { error } = await supabase.rpc(funcName);
      if (error && error.message.includes('does not exist')) {
        console.log(`[ERROR] ${funcName}: Does not exist`);
      } else {
        console.log(`[OK] ${funcName}: Exists`);
        existingFunctions.push(funcName);
      }
    } catch (err) {
      console.log(`? ${funcName}: ${err.message}`);
    }
  }
  
  if (existingFunctions.length === 0) {
    console.log('\n[OK] No old coupon functions found. Cleanup not needed!');
    return;
  }
  
  console.log(`\n[clipboard] Found ${existingFunctions.length} functions to clean up:`);
  existingFunctions.forEach(func => console.log(`   - ${func}`));
  
  console.log('\n[warn]  Since we cannot execute DDL statements directly through the RPC interface,');
  console.log('you need to manually run these DROP statements in your Supabase SQL Editor:\n');
  
  existingFunctions.forEach(funcName => {
    console.log(`DROP FUNCTION IF EXISTS public.${funcName} CASCADE;`);
  });
  
  console.log('\n[clipboard] Steps to clean up:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the DROP statements above');
  console.log('4. Execute them one by one');
  console.log('5. Run this script again to verify cleanup');
  
  // Also provide the full migration SQL
  console.log('\n[idea] Alternatively, you can run the complete migration:');
  console.log('[folder] Copy all SQL from: supabase/migrations/20240927000001_replace_coupon_functions_with_crud.sql');
  console.log('   This will drop old functions AND create the new crud_coupons function');
}

async function verifyCleanup() {
  console.log('\n[search] Verifying cleanup...');
  
  const functionsToCheck = [
    'apply_coupon',
    'delete_global_coupon', 
    'get_global_coupons',
    'update_global_coupon',
    'validate_coupon'
  ];
  
  let allCleaned = true;
  
  for (const funcName of functionsToCheck) {
    try {
      const { error } = await supabase.rpc(funcName);
      if (error && error.message.includes('does not exist')) {
        console.log(`[OK] ${funcName}: Successfully removed`);
      } else {
        console.log(`[ERROR] ${funcName}: Still exists`);
        allCleaned = false;
      }
    } catch (err) {
      console.log(`? ${funcName}: ${err.message}`);
    }
  }
  
  if (allCleaned) {
    console.log('\n[happy] All old coupon functions have been successfully removed!');
    
    // Check if new function exists
    try {
      const { error } = await supabase.rpc('crud_coupons', { action: 'stats' });
      if (error && error.message.includes('does not exist')) {
        console.log('[warn]  New crud_coupons function not found. Make sure to run the full migration.');
      } else {
        console.log('[OK] New crud_coupons function is available!');
      }
    } catch (err) {
      console.log('? crud_coupons function status unclear:', err.message);
    }
  } else {
    console.log('\n[warn]  Some functions still exist. Please complete the cleanup steps above.');
  }
}

// Main execution
async function main() {
  await cleanupOldCouponFunctions();
  await verifyCleanup();
}

main().catch(console.error);