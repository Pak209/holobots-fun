import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user';

export const ensureWelcomeGift = async (
  userId: string,
  currentUser: UserProfile | null,
  setCurrentUser: (user: UserProfile) => void
): Promise<void> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('holos_tokens')
      .eq('id', userId)
      .single();

    if (profile?.holos_tokens === 0) {
      const { error } = await supabase
        .from('profiles')
        .update({ holos_tokens: 500 })
        .eq('id', userId);

      if (error) throw error;

      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, holosTokens: 500 };
        setCurrentUser(updatedUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
      }
    }
  } catch (err) {
    console.error('Welcome gift error:', err);
  }
};

export const persistAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (err) {
    console.error('Error persisting auth token:', err);
  }
};

export const getPersistedAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (err) {
    console.error('Error getting auth token:', err);
    return null;
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['auth_token', 'user_profile']);
  } catch (err) {
    console.error('Error clearing auth data:', err);
  }
};

export const checkSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!data.session;
  } catch (err) {
    console.error('Error checking session:', err);
    return false;
  }
};

export const refreshSession = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    
    if (data.session) {
      await AsyncStorage.setItem('auth_token', data.session.access_token);
    }
  } catch (err) {
    console.error('Error refreshing session:', err);
  }
};