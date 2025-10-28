import { supabaseClientManager } from '../supabase-manager';

// Get the Platform Admin client with proper isolation
export const supabase = supabaseClientManager.getClient({
  serviceName: 'ff-plat-6600',
  storageKey: 'supabase.auth.platform',
  options: {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
});

// Helper functions for ff-plat-6600
export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('[ff-plat-6600] Error fetching user role:', error);
    return null;
  }
  
  return data?.role || null;
}

export async function getUserOrganization(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('entity_platform_id')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('[ff-plat-6600] Error fetching user organization:', error);
    return null;  
  }
  
  return data?.entity_platform_id || null;
}

// Admin-level functions
export async function getAllOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('[ff-plat-6600] Error fetching organizations:', error);
    return [];
  }
  
  return data || [];
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('[ff-plat-6600] Error fetching users:', error);
    return [];
  }
  
  return data || [];
}