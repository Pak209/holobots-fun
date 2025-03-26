
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";

// Ensure new users get 500 Holos tokens when they sign up
export const ensureWelcomeGift = async (
  userId: string, 
  currentUser: UserProfile | null,
  setCurrentUser: (user: UserProfile) => void
): Promise<void> => {
  try {
    // Get the current user profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('holos_tokens')
      .eq('id', userId as any)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching profile for welcome gift:", fetchError);
      return;
    }
    
    // Check if profile is not null and has the holos_tokens property
    if (profile && 'holos_tokens' in profile && profile.holos_tokens === 0) {
      console.log("Giving welcome gift of 500 Holos tokens to new user");
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          holos_tokens: 500 
        } as any)
        .eq('id', userId as any);
      
      if (updateError) {
        console.error("Error giving welcome gift:", updateError);
      } else {
        console.log("Welcome gift of 500 Holos tokens successfully given");
        
        // Update local state if this is the current user
        if (currentUser && currentUser.id === userId) {
          setCurrentUser({
            ...currentUser,
            holosTokens: 500
          });
        }
      }
    }
  } catch (err) {
    console.error("Error in ensureWelcomeGift:", err);
  }
};

// Fix duplicate auth issue
export const clearStaleAuthSessions = async () => {
  try {
    // Clear session from local storage to force a clean state
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      const supabseKeys = keys.filter(key => key.startsWith('supabase.auth.token'));
      
      // If multiple auth tokens exist, clean them up
      if (supabseKeys.length > 1) {
        supabseKeys.forEach(key => localStorage.removeItem(key));
        await supabase.auth.signOut();
        console.log("Cleared stale auth sessions");
      }
    }
  } catch (err) {
    console.error("Error clearing stale auth sessions:", err);
  }
};

// Refresh token if needed
export const refreshTokenIfNeeded = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session) {
      // Only refresh if the token is getting close to expiry (e.g., less than 30 minutes)
      const expiresAt = data.session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const thirtyMinutesInSeconds = 30 * 60;
      
      if (expiresAt && expiresAt - now < thirtyMinutesInSeconds) {
        console.log("Token about to expire, refreshing...");
        await supabase.auth.refreshSession();
      }
    }
  } catch (err) {
    console.error("Error refreshing token:", err);
  }
};
