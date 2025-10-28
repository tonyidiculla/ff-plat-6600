/**
 * Supabase Client Configuration for Node.js Server
 * Platform Admin Portal - Server-side Supabase integration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for regular operations (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Server-side doesn't need to persist sessions
    autoRefreshToken: false,
  },
  db: {
    // Connection pooling for server usage
    pool: {
      min: 0,
      max: 10,
      idleTimeoutMillis: 30000,
    }
  }
});

// Admin client for bypassing RLS when needed (use carefully!)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        pool: {
          min: 0,
          max: 5,
          idleTimeoutMillis: 30000,
        }
      }
    })
  : null;

// Helper function to get authenticated user from JWT token
export const getAuthenticatedUser = async (authToken) => {
  if (!authToken) {
    throw new Error('No authentication token provided');
  }

  // Remove 'Bearer ' prefix if present
  const token = authToken.replace(/^Bearer\s+/, '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    return user;
  } catch (error) {
    throw new Error(`Invalid authentication token: ${error.message}`);
  }
};

// Helper function to create authenticated supabase client for a user
export const createAuthenticatedClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// Database connection test
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    console.log('[OK] Supabase connection successful');
    return true;
  } catch (error) {
    console.error('[ERROR] Supabase connection failed:', error.message);
    return false;
  }
};

// Export default client
export default supabase;