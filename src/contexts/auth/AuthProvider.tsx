import { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType } from "./types";
import { UserProfile } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User 
} from "@/lib/firebase";
import { 
  getUserProfile as getFirestoreUserProfile, 
  createUserProfile, 
  updateUserProfile, 
  searchPlayers as firestoreSearchPlayers
} from "@/lib/firestore";
import { useNavigate } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";
import { useRewardStore } from "@/stores/rewardStore";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_DEBUG = import.meta.env.MODE === 'development';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const { clearUserData } = useRewardStore();

  function logDebug(...args: any[]) {
    if (AUTH_DEBUG) {
      console.log('[Auth Debug]', ...args);
    }
  }

  async function fetchUserProfile(userId: string) {
    try {
      logDebug('Fetching profile for user:', userId);
      
      const profile = await getFirestoreUserProfile(userId);
      
      if (!profile) {
        logDebug('No profile found for user:', userId);
        return null;
      }
      
      logDebug('Profile found:', profile);
      return profile;
    } catch (err) {
      logDebug('Exception in fetchUserProfile:', err);
      throw err;
    }
  }

  async function handleUserProfile(userId: string, userProfile: UserProfile | null) {
    if (!userProfile) {
      logDebug('No profile found for user:', userId);
      setError("Profile not found. Please try logging out and in again.");
      setCurrentUser(null);
      return;
    }
    
    setCurrentUser(userProfile);
    setError(null);
    
    setTimeout(() => {
      ensureWelcomeGift(userId, userProfile, setCurrentUser)
        .catch(err => logDebug('Welcome gift error:', err));
    }, 0);
  }

  async function handleSession(session: any) {
    logDebug('Handling session:', session?.user?.id || 'No session');
    
    if (!session?.user) {
      setCurrentUser(null);
      return;
    }

    try {
      const userId = session.user.id;
      const userProfile = await fetchUserProfile(userId);
      await handleUserProfile(userId, userProfile);
    } catch (err) {
      logDebug('Error in handleSession:', err);
      setError(err instanceof Error ? err.message : "Failed to load user profile");
      setCurrentUser(null);
    }
  }

  useEffect(() => {
    logDebug('Auth provider initialized');
    setLoading(true);
    let isMounted = true;
    
    async function initializeAuth() {
      try {
        logDebug('Setting up auth state listener');
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          logDebug('Auth state changed:', firebaseUser?.uid);
          
          if (!isMounted) return;
          
          if (!firebaseUser) {
            setCurrentUser(null);
            setError(null);
            clearUserData();
            setLoading(false);
            setAuthInitialized(true);
          } else {
            try {
              const userProfile = await fetchUserProfile(firebaseUser.uid);
              await handleUserProfile(firebaseUser.uid, userProfile);
            } catch (err) {
              logDebug('Error fetching user profile:', err);
              setError(err instanceof Error ? err.message : "Failed to load user profile");
              setCurrentUser(null);
            }
            setLoading(false);
            setAuthInitialized(true);
          }
        });
        
        return () => {
          isMounted = false;
          unsubscribe();
        };
      } catch (err) {
        logDebug('Error initializing auth:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Authentication error");
          setLoading(false);
          setCurrentUser(null);
        }
        return () => { isMounted = false; };
      }
    }
    
    initializeAuth();
    
    return () => { isMounted = false; };
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error("Login successful but no user returned");
      }
      logDebug('Login successful:', userCredential.user.uid);
      
      const userProfile = await fetchUserProfile(userCredential.user.uid);
      if (userProfile) {
        setCurrentUser(userProfile);
      }
      
      toast({
        title: "Login Successful",
        description: "You have been logged in",
      });
      
      return;
    } catch (err: any) {
      logDebug('Login error:', err);
      const errorMessage = err.code === 'auth/invalid-credential' 
        ? "Invalid email or password" 
        : err.message || "Login failed";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting logout');
      
      await signOut(auth);
      
      setCurrentUser(null);
      clearUserData();
      navigate('/');
      
      toast({
        title: "Logged Out",
        description: "You have been logged out",
      });
    } catch (err) {
      logDebug('Logout error:', err);
      setError(err instanceof Error ? err.message : "Logout failed");
      toast({
        title: "Logout Failed",
        description: err instanceof Error ? err.message : "Failed to log out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function signup(email: string, password: string, username: string, onboardingPath?: 'owner' | 'rental') {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting signup for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error("Signup successful but no user returned");
      }
      
      await createUserProfile(userCredential.user.uid, {
        username,
        email,
        onboardingPath
      });
      
      logDebug('Signup successful:', userCredential.user.uid);
      
      const userProfile = await fetchUserProfile(userCredential.user.uid);
      if (userProfile) {
        setCurrentUser(userProfile);
      }
      
      toast({
        title: "Signup Successful",
        description: "Your account has been created",
      });
    } catch (err: any) {
      logDebug('Signup error:', err);
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? "Email is already in use"
        : err.code === 'auth/weak-password'
        ? "Password is too weak"
        : err.message || "Signup failed";
      setError(errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(updates: Partial<UserProfile>): Promise<void> {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    try {
      logDebug('Updating user profile:', updates);
      
      await updateUserProfile(currentUser.id, updates);
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      
      logDebug('User profile updated successfully:', updatedUser);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated",
      });
    } catch (error) {
      logDebug('Error updating user:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  }

  async function searchPlayers(query: string): Promise<UserProfile[]> {
    try {
      logDebug('Searching players with query:', query);
      
      const players = await firestoreSearchPlayers(query, 10);
      
      return players;
    } catch (error) {
      logDebug('Error searching players:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search players",
        variant: "destructive",
      });
      return [];
    }
  }

  async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      logDebug('Getting user profile for:', userId);
      return await fetchUserProfile(userId);
    } catch (error) {
      logDebug('Error getting user profile:', error);
      return null;
    }
  }

  function debugAuth() {
    if (import.meta.env.MODE !== 'development') return null;
    
    return {
      checkSession: async () => {
        const currentFirebaseUser = auth.currentUser;
        console.log('Current Firebase user:', currentFirebaseUser);
        return currentFirebaseUser;
      },
      resetAuthState: () => {
        setLoading(false);
        setError(null);
        console.log('Auth state reset');
      },
      status: {
        initialized: authInitialized,
        loading,
        error,
        user: currentUser,
      }
    };
  }

  const contextValue: AuthContextType = {
    user: currentUser,
    loading,
    error,
    login,
    logout,
    signup,
    updateUser,
    searchPlayers,
    getUserProfile,
    ...(AUTH_DEBUG ? { debug: debugAuth() } : {})
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
