import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import Constants from 'expo-constants';

// Load environment variables
const supabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Enhanced Supabase client configuration
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce', // More secure authentication flow
    },
    global: {
      headers: {
        'X-App-Version': Constants.expoConfig?.version || '1.0.0',
      },
    },
  }
);

// Session management utilities
export const getActiveSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Session retrieval error:', error.message);
    return null;
  }
  return session;
};

export const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('Session refresh error:', error.message);
    return null;
  }
  return session;
};

// Security utility to clear sensitive data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([
      'supabase.auth.token',
      'supabase.auth.refreshToken',
      'user_profile',
      'auth_token'
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Helper functions
export const updateHolobotExperience = (holobots, holobotName, newExperience, newLevel) => {
  if (!holobots || !Array.isArray(holobots)) {
    return [];
  }
  
  return holobots.map(holobot => {
    if (holobot.name.toLowerCase() === holobotName.toLowerCase()) {
      return {
        ...holobot,
        level: newLevel,
        experience: newExperience,
        nextLevelExp: calculateExperience(newLevel)
      };
    }
    return holobot;
  });
};

export const calculateExperience = (level) => {
  const BASE_XP = 100;
  return Math.floor(BASE_XP * Math.pow(level, 2));
};

export const HOLOBOT_STATS = {
  MAX_LEVEL: 50,
  BASE_HEALTH: 100,
  BASE_ATTACK: 10,
  BASE_DEFENSE: 5,
  BASE_SPEED: 8
};

// Function to get Holobot image URL
export const getHolobotImageUrl = (nameOrKey) => {
  if (!nameOrKey) return null;
  const key = nameOrKey.toLowerCase();
  return `https://pfpidggrdnmfgrbncpyl.supabase.co/storage/v1/object/public/holobots/${key}.png`;
};