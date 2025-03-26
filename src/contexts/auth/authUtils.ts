
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";

export const ensureWelcomeGift = async (
  userId: string,
  currentUser: UserProfile | null,
  setCurrentUser: (user: UserProfile) => void
): Promise<void> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('holos_tokens')
    .eq('id', userId)
    .single();

  if (profile?.holos_tokens === 0) {
    await supabase
      .from('profiles')
      .update({ holos_tokens: 500 })
      .eq('id', userId);

    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, holosTokens: 500 });
    }
  }
};
