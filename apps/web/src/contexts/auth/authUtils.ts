
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
      .eq('id', userId)
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
        })
        .eq('id', userId);
      
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

// Helper function to persist auth token
export const persistAuthToken = async (token: string): Promise<void> => {
  try {
    localStorage.setItem('auth_token', token);
    console.log("Auth token persisted successfully");
  } catch (err) {
    console.error("Error persisting auth token:", err);
  }
};

// Helper function to get auth token from storage
export const getPersistedAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch (err) {
    console.error("Error getting auth token:", err);
    return null;
  }
};
