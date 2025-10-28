import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[ERROR] Missing environment variables');
  console.error('Available vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  process.exit(1);
}

console.log('[link] Using Supabase URL:', supabaseUrl);
console.log('[key] Using key type:', supabaseKey === process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Publishable');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCouponFunctions() {
  console.log('[search] Checking for coupon-related functions in the database...\n');
  
  const couponFunctions = [
    'apply_coupon',
    'delete_global_coupon', 
    'get_coupon_stats',
    'get_global_coupons',
    'insert_global_coupon',
    'update_global_coupon',
    'validate_coupon'
  ];

  // Query to check if functions exist in public schema
  const query = `
    SELECT 
      routine_name,
      routine_schema,
      routine_type,
      data_type as return_type
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = ANY($1)
    ORDER BY routine_name;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: query,
      params: [couponFunctions]
    });

    if (error) {
      console.error('[ERROR] Error querying database:', error);
      
      // Fallback: Try direct SQL query
      console.log('\n[refresh] Trying alternative approach...\n');
      
      for (const funcName of couponFunctions) {
        try {
          // Try to call each function to see if it exists
          const { data: testData, error: testError } = await supabase.rpc(funcName);
          
          if (testError) {
            if (testError.message.includes('function') && testError.message.includes('does not exist')) {
              console.log(`[ERROR] ${funcName}: Function does not exist`);
            } else {
              console.log(`[OK] ${funcName}: Function exists (error: ${testError.message})`);
            }
          } else {
            console.log(`[OK] ${funcName}: Function exists and callable`);
          }
        } catch (err) {
          console.log(`[ERROR] ${funcName}: Error testing function - ${err.message}`);
        }
      }
      return;
    }

    if (!data || data.length === 0) {
      console.log('[ERROR] No coupon-related functions found in public schema\n');
      
      // Double-check by testing each function
      console.log('[refresh] Double-checking by testing function calls...\n');
      
      for (const funcName of couponFunctions) {
        try {
          const { data: testData, error: testError } = await supabase.rpc(funcName);
          
          if (testError) {
            if (testError.message.includes('function') && testError.message.includes('does not exist')) {
              console.log(`[ERROR] ${funcName}: Confirmed - Function does not exist`);
            } else {
              console.log(`[warn]  ${funcName}: Function exists but returned error: ${testError.message}`);
            }
          } else {
            console.log(`[OK] ${funcName}: Function exists and returned data`);
          }
        } catch (err) {
          console.log(`[ERROR] ${funcName}: ${err.message}`);
        }
      }
    } else {
      console.log('[OK] Found the following coupon-related functions:\n');
      
      data.forEach(func => {
        console.log(`[clipboard] Function: ${func.routine_name}`);
        console.log(`   Schema: ${func.routine_schema}`);
        console.log(`   Type: ${func.routine_type}`);
        console.log(`   Returns: ${func.return_type}\n`);
      });
    }

  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
  }
}

// Also check what functions are actually available
async function listAllFunctions() {
  console.log('\n[note] Listing all available functions in public schema...\n');
  
  try {
    // Get all functions in public schema
    const query = `
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%coupon%'
      ORDER BY routine_name;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: query
    });
    
    if (error) {
      console.log('[ERROR] Could not query schema directly');
      
      // Try getting available RPC functions by testing known patterns
      const testFunctions = [
        'get_global_coupons',
        'apply_coupon', 
        'validate_coupon',
        'insert_global_coupon',
        'update_global_coupon',
        'delete_global_coupon',
        'get_coupon_stats'
      ];
      
      console.log('[refresh] Testing known coupon function patterns...\n');
      
      for (const func of testFunctions) {
        try {
          const { error: rpcError } = await supabase.rpc(func);
          if (rpcError && rpcError.message.includes('does not exist')) {
            console.log(`[ERROR] ${func}: Does not exist`);
          } else {
            console.log(`[OK] ${func}: Exists`);
          }
        } catch (err) {
          console.log(`? ${func}: ${err.message}`);
        }
      }
    } else {
      if (data && data.length > 0) {
        console.log('Found coupon-related functions:');
        data.forEach(func => {
          console.log(`- ${func.routine_name} (${func.routine_type})`);
        });
      } else {
        console.log('No functions with "coupon" in the name found');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  console.log('[rocket] Connecting to Supabase database...\n');
  
  await checkCouponFunctions();
  await listAllFunctions();
  
  console.log('\n[OK] Database check complete!');
}

main().catch(console.error);
