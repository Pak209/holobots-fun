import { UserProfile } from "@/types/user";

// Ensure new users get Genesis reward package when they sign up
// This function is now DISABLED since Genesis rewards are handled through the mint process
export const ensureWelcomeGift = async (
  userId: string, 
  currentUser: UserProfile | null,
  setCurrentUser: (user: UserProfile) => void
): Promise<void> => {
  // DISABLED: Genesis rewards are now handled through the mint process
  // This prevents conflicts between welcome gifts and the mint process
  console.log("Welcome gift function called but disabled - Genesis rewards handled via mint process");
  return;
};
