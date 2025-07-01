import { useAuth } from "@/contexts/auth";
import { useDevModeStore } from "@/stores/devModeStore";

/**
 * Hook to check if the current user has dev access
 * @returns boolean indicating if user has dev access
 */
export function useDevAccess(): boolean {
  const { user } = useAuth();
  const { isDevModeEnabled } = useDevModeStore();
  
  // Must be a dev account AND have dev mode enabled
  return user?.isDevAccount === true && isDevModeEnabled;
}

/**
 * Hook to get dev access info including user details
 * @returns object with dev access status and user info
 */
export function useDevAccessInfo() {
  const { user } = useAuth();
  const { isDevModeEnabled } = useDevModeStore();
  
  return {
    hasDevAccess: user?.isDevAccount === true && isDevModeEnabled,
    isDevAccount: user?.isDevAccount === true,
    isDevModeEnabled,
    username: user?.username,
    userId: user?.id
  };
} 