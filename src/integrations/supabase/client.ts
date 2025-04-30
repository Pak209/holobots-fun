import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Safely updates a user profile by explicitly specifying the table name to avoid ambiguous column references
 */
export async function safeUpdateUserProfile(userId: string, updates: any) {
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
}
