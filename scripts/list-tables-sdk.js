#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const schemaArg = process.argv[2];

async function listTables() {
  console.log('Listing tables via Supabase SDK...\n');
  
  // Query information_schema to get table info
  const query = `
    SELECT 
      table_schema as schema,
      table_name as name,
      table_type as kind
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'auth', 'storage', 'realtime', 'supabase_functions')
    ${schemaArg ? `AND table_schema = '${schemaArg}'` : ''}
    ORDER BY table_schema, table_name
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { query });
    
    if (error) {
      console.log('[ERROR] RPC exec_sql not available, trying direct schema query...');
      
      // Try querying specific schema tables directly
      if (schemaArg === 'global') {
        const tables = [
          'profiles', 'modules_master_l01', 'entity_master_l01', 
          'location_master_l01', 'role_master_l01'
        ];
        
        console.log('Schema: global');
        console.log('Known tables from code analysis:');
        for (const table of tables) {
          try {
            const { error: testError } = await supabase.schema('global').from(table).select('*').limit(0);
            console.log(`  [OK] ${table} - ${testError ? 'error: ' + testError.message : 'accessible'}`);
          } catch (e) {
            console.log(`  [ERROR] ${table} - ${e.message}`);
          }
        }
      }
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No tables found.');
      return;
    }
    
    const bySchema = data.reduce((acc, row) => {
      acc[row.schema] ||= [];
      acc[row.schema].push({ name: row.name, kind: row.kind });
      return acc;
    }, {});
    
    for (const schema of Object.keys(bySchema).sort()) {
      console.log(`\nSchema: ${schema}`);
      console.table(bySchema[schema]);
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

listTables();