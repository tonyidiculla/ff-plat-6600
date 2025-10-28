import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[ERROR] Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('[rocket] Running coupon CRUD migration...\n');
  
  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20240927000001_replace_coupon_functions_with_crud.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('[ERROR] Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Split the SQL into individual statements (basic splitting by semicolon)
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`[note] Found ${statements.length} SQL statements to execute\n`);
  
  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (statement.length === 0) continue;
    
    console.log(`[timer] Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      // For complex statements, we'll use rpc to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      });
      
      if (error) {
        // If exec_sql doesn't exist, try direct execution for simple statements
        if (error.message.includes('exec_sql')) {
          console.log(`   [warn]  Direct SQL execution not available, trying alternative approach...`);
          
          // For DROP statements, we can try using supabase.rpc with function names
          if (statement.toUpperCase().includes('DROP FUNCTION')) {
            console.log(`   [OK] Skipped DROP statement (functions may not exist)`);
            continue;
          }
          
          // For other statements, we'll log them for manual execution
          console.log(`   [ERROR] Cannot execute: ${statement.substring(0, 100)}...`);
          console.log(`   [idea] Please execute this manually in Supabase SQL editor`);
        } else {
          console.log(`   [ERROR] Error: ${error.message}`);
        }
      } else {
        console.log(`   [OK] Success`);
      }
      
    } catch (err) {
      console.log(`   [ERROR] Unexpected error: ${err.message}`);
    }
  }
  
  console.log('\n[search] Verifying the new CRUD function exists...\n');
  
  // Test the new function
  try {
    const { data, error } = await supabase.rpc('crud_coupons', {
      action: 'stats'
    });
    
    if (error) {
      console.log('[ERROR] CRUD function test failed:', error.message);
      console.log('\n[clipboard] Manual steps required:');
      console.log('1. Copy the migration SQL from supabase/migrations/20240927000001_replace_coupon_functions_with_crud.sql');
      console.log('2. Go to your Supabase project dashboard');
      console.log('3. Navigate to SQL Editor');
      console.log('4. Paste and execute the migration SQL');
    } else {
      console.log('[OK] CRUD function is working!');
      console.log('[chart] Stats result:', data);
    }
    
  } catch (err) {
    console.log('[ERROR] Function test error:', err.message);
  }
}

runMigration().catch(console.error);