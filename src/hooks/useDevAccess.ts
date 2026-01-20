import { useAuth } from "@/contexts/auth";
import { useDevModeStore } from "@/stores/devModeStore";

export function useDevAccess(): boolean {
  const { user } = useAuth();
  const { isDevModeEnabled } = useDevModeStore();
  
  return user?.isDevAccount === true && isDevModeEnabled;
}

export function useDevAccessInfo() {
  const { user } = useAuth();
  const { isDevModeEnabled } = useDevModeStore();
  
  const isDevAccount = user?.isDevAccount === true;
  const hasDevAccess = isDevAccount && isDevModeEnabled;
  
  return {
    hasDevAccess,
    isDevAccount,
    isDevModeEnabled,
    username: user?.username,
    userId: user?.id
  };
}
