#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function testAllRPCFunctions() {
  console.log('[search] Testing all RPC functions from types.ts\n');
  
  // Extract all RPC function names from the types file
  const rpcFunctions = [
    // Global data functions
    'get_global_breeds',
    'get_global_channel_partners', 
    'get_global_coupons',
    'get_global_organizations',
    'get_global_pets',
    'get_global_pets_onboarding',
    'get_global_profiles',
    'get_global_species',
    'get_global_user_profiles',
    
    // Module functions
    'get_modules_data',
    'get_hms_modules_tree_data',
    
    // Other functions
    'get_platform_roles',
    'get_platform_managers',
    'get_organizations_entities',
    'get_cp_territories',
    'get_cp_partners',
    'get_hospital_subscriptions',
    'get_pstore_subscriptions', 
    'get_estore_subscriptions',
    'get_pet_species_detailed'
  ];

  const working = [];
  const broken = [];

  for (const rpcName of rpcFunctions) {
    try {
      const { data, error } = await supabase.rpc(rpcName).limit(1);
      if (error) {
        broken.push({ name: rpcName, error: error.message });
      } else {
        const sampleKeys = data?.[0] ? Object.keys(data[0]).slice(0, 3).join(', ') : 'no data';
        working.push({ name: rpcName, sampleKeys, hasData: data?.length > 0 });
      }
    } catch (err) {
      broken.push({ name: rpcName, error: err.message });
    }
  }

  console.log(`[OK] WORKING RPC FUNCTIONS (${working.length}):`);
  working.forEach(rpc => {
    console.log(`   ${rpc.name} - Sample: ${rpc.sampleKeys} ${rpc.hasData ? '(has data)' : '(empty)'}`);
  });

  console.log(`\n[ERROR] BROKEN RPC FUNCTIONS (${broken.length}):`);
  broken.forEach(rpc => {
    console.log(`   ${rpc.name} - Error: ${rpc.error}`);
  });

  console.log(`\n[chart] Summary: ${working.length} working, ${broken.length} broken`);
}

testAllRPCFunctions().catch(console.error);