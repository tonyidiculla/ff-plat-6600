#!/usr/bin/env node
// Hardened migration executor script
// - Uses service role key (required for DDL) if available
// - Verifies exec_sql helper availability
// - Splits SQL safely (respects $$ function bodies)
// - Skips GRANT statements (can't run with lesser creds if not allowed)
// - Provides concise logging & error continuation

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import url from 'url';
import 'dotenv/config';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default migration file (adjust or pass via CLI: node scripts/apply-migration.js path/to/file.sql)
const passedFile = process.argv[2];
const MIGRATION_FILE = path.resolve(
  __dirname,
  passedFile || '../supabase/migrations/20240926000001_replace_system_roles_with_platform_roles.sql'
);

// Resolve env variables with fallbacks
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SECRET || process.env.SUPABASE_SERVICE_ROLE;
const FALLBACK_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('[ERROR] Missing SUPABASE_URL (or VITE_/NEXT_PUBLIC_/SUPABASE_URL). Add it to a local .env file.');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.warn('[warn]  No service role key supplied. DDL may fail. Provide SUPABASE_SERVICE_ROLE_KEY for full capability.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || FALLBACK_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function splitSql(sql) {
  const statements = [];
  let current = '';
  let inDollar = false;
  let tag = null;
  for (let i = 0; i < sql.length; i++) {
    const slice = sql.slice(i);
    const match = slice.match(/^\$[a-zA-Z0-9_]*\$/); // $tag$ or $$
    if (match) {
      const marker = match[0];
      if (!inDollar) {
        inDollar = true;
        tag = marker;
        current += marker;
        i += marker.length - 1;
        continue;
      } else if (marker === tag) {
        inDollar = false;
        tag = null;
        current += marker;
        i += marker.length - 1;
        continue;
      }
    }
    const ch = sql[i];
    if (ch === ';' && !inDollar) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }
  const leftover = current.trim();
  if (leftover) statements.push(leftover);
  return statements;
}

async function ensureExecSqlExists() {
  const { error } = await supabase.rpc('exec_sql', { query: 'select 1' });
  if (error) {
    if (/exec_sql/i.test(error.message)) {
      console.error('[ERROR] exec_sql function not found or not executable.');
      console.error('Add it with (in Supabase SQL editor):');
      console.error(`\nCREATE OR REPLACE FUNCTION public.exec_sql(query text)\nRETURNS void AS $$ BEGIN EXECUTE query; END; $$ LANGUAGE plpgsql SECURITY DEFINER;\nREVOKE ALL ON FUNCTION public.exec_sql(text) FROM public;\nGRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;\n`);
      process.exit(1);
    }
  }
}

async function applyMigration() {
  console.log('[refresh] Applying migration file');
  console.log('[doc] File:', MIGRATION_FILE);

  if (!existsSync(MIGRATION_FILE)) {
    console.error('[ERROR] Migration file not found. Pass a path: node scripts/apply-migration.js path/to/file.sql');
    process.exit(1);
  }

  let sql;
  try {
    sql = readFileSync(MIGRATION_FILE, 'utf8');
  } catch (e) {
    console.error('[ERROR] Failed reading migration file:', e.message);
    process.exit(1);
  }

  await ensureExecSqlExists();

  const statements = splitSql(sql)
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^--\s*$/m.test(s));

  console.log(`[puzzle] Parsed ${statements.length} statements.`);
  if (!SERVICE_ROLE_KEY) {
    console.log('[warn]  Running WITHOUT service role key. Some statements may fail with permission errors.');
  }

  let successCount = 0;
  let errorCount = 0;

  for (const stmt of statements) {
    if (/^grant\s/i.test(stmt)) {
      console.log('[warn]  Skipping GRANT (manual or requires service role):', stmt.split('\n')[0]);
      continue;
    }
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 90) + (stmt.length > 90 ? '...' : '');
    process.stdout.write(`>  ${preview} `);
    const { error } = await supabase.rpc('exec_sql', { query: stmt });
    if (error) {
      errorCount++;
      process.stdout.write('\n   [ERROR] ' + error.message + '\n');
    } else {
      successCount++;
      process.stdout.write('[OK]\n');
    }
  }

  console.log(`\n[happy] Done. Successful: ${successCount}, Errors: ${errorCount}`);

  if (errorCount > 0) {
    console.log('[search] Review errors above. You can re-run after fixing issues or execute problem statements manually.');
  }

  // Optional post-migration smoke test (example function)
  if (statements.some(s => /get_platform_roles/i.test(s))) {
    console.log('\n[lab] Testing get_platform_roles ...');
    const { data, error } = await supabase.rpc('get_platform_roles');
    if (error) {
      console.log('   [ERROR] Test failed:', error.message);
    } else {
      console.log('   [OK] Returned rows:', data?.length || 0);
    }
  }
}

applyMigration().catch(err => {
  console.error('Unhandled failure:', err);
  process.exit(1);
});