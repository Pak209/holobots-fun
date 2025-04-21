import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Profile = Database['public']['Tables']['profiles']['Row']

class SupabaseService {
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async syncSession(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data.session) {
        await AsyncStorage.setItem('supabase.auth.token', data.session.access_token);
      }
    } catch (error) {
      console.error('Error syncing session:', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await AsyncStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
  
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }
  
  async signUp(email: string, password: string, username: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();