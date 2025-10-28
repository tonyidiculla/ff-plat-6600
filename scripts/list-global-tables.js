#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function listGlobalSchemaViaRPC() {
  console.log('[clipboard] Global Schema Tables (via RPC functions)\n');
  
  const workingRPCs = [
    { name: 'get_global_coupons', table: 'coupons/discounts table', description: 'Global coupon and discount management' },
    { name: 'get_global_pets', table: 'pets table', description: 'Global pet directory and records' },
    { name: 'get_global_breeds', table: 'breeds table', description: 'Pet breed definitions' },
    { name: 'get_global_user_profiles', table: 'user_profiles table', description: 'Extended user profile information' }
  ];
  
  const brokenRPCs = [
    { name: 'get_global_organizations', table: 'organizations/entity_master_l01', error: 'column g.id does not exist' },
    { name: 'get_global_species', table: 'species table', error: 'column ps.diet_type does not exist' },
    { name: 'get_global_profiles', table: 'profiles table', error: 'function not found without parameters' },
    { name: 'get_global_channel_partners', table: 'channel_partners/entity_master_l01', error: 'relation entity_master_l01 does not exist' }
  ];

  console.log('[OK] WORKING TABLES (accessible via RPC):');
  for (const rpc of workingRPCs) {
    try {
      const { data, error } = await supabase.rpc(rpc.name).limit(1);
      if (!error && data) {
        const sampleKeys = data[0] ? Object.keys(data[0]).slice(0, 5).join(', ') : 'no data';
        console.log(`   [chart] ${rpc.table}`);
        console.log(`      RPC: ${rpc.name}`);
        console.log(`      Purpose: ${rpc.description}`);
        console.log(`      Sample columns: ${sampleKeys}`);
        console.log(`      Records: ${data.length > 0 ? 'Has data' : 'Empty'}\n`);
      }
    } catch (err) {
      console.log(`   [ERROR] ${rpc.table}: ${err.message}\n`);
    }
  }

  console.log('[ERROR] PROBLEMATIC TABLES (RPC functions have issues):');
  for (const rpc of brokenRPCs) {
    console.log(`   [tool] ${rpc.table}`);
    console.log(`      RPC: ${rpc.name}`);
    console.log(`      Issue: ${rpc.error}\n`);
  }

  // Also check what other tables are referenced in code
  console.log('[note] ADDITIONAL TABLES (from code analysis):');
  const codeTables = [
    'profiles - User authentication profiles',
    'modules_master_l01 - Platform module definitions', 
    'entity_master_l01 - Entity/organization master records',
    'location_master_l01 - Geographic location data',
    'role_master_l01 - Role and permission definitions'
  ];
  
  for (const table of codeTables) {
    console.log(`   [clipboard] ${table}`);
  }
}

listGlobalSchemaViaRPC().catch(console.error);