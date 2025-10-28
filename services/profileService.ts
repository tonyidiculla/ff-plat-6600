import { supabase } from '@/lib/supabase/client';
import { Profile, ProfileUpdate } from '@/types/profile';

export class ProfileService {
  /**
   * Get current user's profile
   */
  static async getCurrentProfile(): Promise<Profile | null> {
    try {
      // Get the current authenticated user first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log('No authenticated user found:', authError?.message);
        return null;
      }

      // Get profile from public.profiles table (schema is exposed)
      const { data, error } = await (supabase as any)
        .schema('public')
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('public.profiles schema not yet accessible via API:', error.message);
        console.log('Note: Schema is exposed in settings but PostgREST may need restart to recognize it');
        // Return null for now - this will be handled by the UI gracefully
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Update current user's profile
   */
  static async updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
    try {
      // Get the current authenticated user first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Update the profile in public.profiles table
      const { data, error } = await (supabase as any)
        .schema('public')
        .from('profiles')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.warn('public.profiles schema not yet accessible for updates:', error.message);
        console.log('Note: Schema is exposed in settings but PostgREST may need restart to recognize it');
        // Return null for now - updates will be handled gracefully by UI
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Search user profiles (for admin use)
   */
  static async searchProfiles(searchTerm: string = '', limitCount: number = 50): Promise<Profile[]> {
    try {
      console.log('Search profiles functionality not implemented - returning empty results');
      // Return empty array until proper RPC functions are set up
      return [];
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

}