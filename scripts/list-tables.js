#!/usr/bin/env node
import 'dotenv/config';
import pg from 'pg';
import dns from 'node:dns';
import { promises as dnsPromises } from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
const { Client } = pg;

/*
Usage:
  node scripts/list-tables.js                 # lists all tables across schemas
  node scripts/list-tables.js global          # lists only tables in 'global' schema

Env:
  SUPABASE_DB_URL or DATABASE_URL must be set to a Postgres connection string with rights to read pg_catalog.
*/

const schemaArg = process.argv[2];

function buildSupabaseConnectionStringFromEnv() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
  let projectRef = process.env.VITE_SUPABASE_PROJECT_ID;
  if (!projectRef && process.env.VITE_SUPABASE_URL) {
    try {
      const host = new URL(process.env.VITE_SUPABASE_URL).host; // <ref>.supabase.co
      projectRef = host.split('.')[0];
    } catch (e) {
      // ignore
    }
  }
  if (dbPassword && projectRef) {
    const host = `${projectRef}.supabase.co`;
    return `postgres://postgres:${encodeURIComponent(dbPassword)}@${host}:6543/postgres?sslmode=require&pgbouncer=true`;
  }
  return undefined;
}

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || buildSupabaseConnectionStringFromEnv();
if (!connectionString) {
  console.error('Missing database connection info. Set SUPABASE_DB_URL or DATABASE_URL, or provide VITE_SUPABASE_PROJECT_ID/VITE_SUPABASE_URL and SUPABASE_DB_PASSWORD in .env');
  process.exit(1);
}

console.log('Using connection string:', connectionString.replace(/:([^@]+)@/, ':***@'));

const query = `
SELECT
  n.nspname       AS schema,
  c.relname       AS name,
  CASE c.relkind
    WHEN 'r' THEN 'table'
    WHEN 'p' THEN 'partitioned table'
    WHEN 'v' THEN 'view'
    WHEN 'm' THEN 'materialized view'
    WHEN 'f' THEN 'foreign table'
    WHEN 't' THEN 'toast table'
    ELSE c.relkind::text
  END             AS kind,
  pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
  obj_description(c.oid) AS comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r','p','f')
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  ${schemaArg ? `AND n.nspname = $1` : ''}
ORDER BY n.nspname, c.relname;
`;

function toUrl(str) {
  return new URL(str);
}

async function forceIPv4ConnectionString(connStr) {
  try {
    const url = toUrl(connStr);
    const host = url.hostname;
    console.log('Resolving host:', host);
    const { address } = await dnsPromises.lookup(host, { family: 4 });
    console.log('Got IPv4 address:', address);
    url.hostname = address; // use IPv4 literal
    const result = url.toString();
    console.log('IPv4 connection string:', result.replace(/:([^@]+)@/, ':***@'));
    return result;
  } catch (e) {
    console.log('Failed to resolve IPv4, using original:', e.message);
    return connStr; // fallback to original
  }
}

async function runQueryWithConnectionString(connStr) {
  const parsed = toUrl(connStr);
  const servername = parsed.hostname; // preserve SNI servername when we may switch to IPv4 literal
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false, servername } });
  await client.connect();
  try {
    const res = await client.query(query, schemaArg ? [schemaArg] : []);
    return res.rows;
  } finally {
    await client.end();
  }
}

function setUrlParam(urlStr, key, value) {
  const u = new URL(urlStr);
  u.searchParams.set(key, value);
  return u.toString();
}

function setUrlPort(urlStr, port) {
  const u = new URL(urlStr);
  u.port = String(port);
  return u.toString();
}

async function main() {
  let rows;
  try {
    const v4conn = await forceIPv4ConnectionString(connectionString);
    rows = await runQueryWithConnectionString(v4conn);
  } catch (err) {
    const code = err && err.code;
    const transient = ['EHOSTUNREACH', 'ETIMEDOUT', 'ECONNREFUSED'];
    if (transient.includes(code)) {
      let fallback = setUrlPort(connectionString, 6543);
      fallback = setUrlParam(fallback, 'pgbouncer', 'true');
      fallback = setUrlParam(fallback, 'sslmode', 'require');
      const v4fallback = await forceIPv4ConnectionString(fallback);
      rows = await runQueryWithConnectionString(v4fallback);
    } else {
      throw err;
    }
  }

  if (!rows || rows.length === 0) {
    console.log('No relations found.');
    return;
  }

  const simple = rows.map(r => ({ schema: r.schema, name: r.name, kind: r.kind, size: r.total_size }));
  const bySchema = simple.reduce((acc, r) => {
    acc[r.schema] ||= [];
    acc[r.schema].push(r);
    return acc;
  }, {});
  for (const schema of Object.keys(bySchema).sort()) {
    console.log(`\nSchema: ${schema}`);
    console.table(bySchema[schema].map(({ name, kind, size }) => ({ name, kind, size })));
  }
}

main().catch(err => {
  console.error('Error listing tables:', err.message);
  console.error('Error code:', err.code);
  console.error('Full error:', err);
  process.exit(1);
});
