import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";

// Ensure new users get Genesis reward package when they sign up
export const ensureWelcomeGift = async (
  userId: string, 
  currentUser: UserProfile | null,
  setCurrentUser: (user: UserProfile) => void
): Promise<void> => {
  try {
    // Get the current user profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('holos_tokens, gacha_tickets, arena_passes')
      .eq('id', userId as any)
      .maybeSingle();
    
    if (fetchError) {
      console.error("Error fetching profile for welcome gift:", fetchError);
      return;
    }
    
    // Check if profile exists and if they haven't received the Genesis reward package yet
    // We'll check if they have 0 gacha tickets as an indicator they haven't received the package
    if (profile && profile.gacha_tickets === 0) {
      console.log("Giving Genesis reward package to new user");
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          gacha_tickets: 10, // Add 10 Gacha Tickets
          arena_passes: (profile.arena_passes || 0) + 5 // Add 5 Arena Passes
        } as any)
        .eq('id', userId as any);
      
      if (updateError) {
        console.error("Error giving Genesis reward package:", updateError);
      } else {
        console.log("Genesis reward package successfully given");
        
        // Update local state if this is the current user
        if (currentUser && currentUser.id === userId) {
          const currentInventory = currentUser.inventory || { common: 0, rare: 0, legendary: 0 };
          setCurrentUser({
            ...currentUser,
            gachaTickets: 10,
            arena_passes: (currentUser.arena_passes || 0) + 5,
            inventory: {
              ...currentInventory,
              common: (currentInventory.common || 0) + 5 // Add 5 Common Boosters to client-side inventory
            }
          });
        }
      }
    }
  } catch (err) {
    console.error("Error in ensureWelcomeGift:", err);
  }
};
