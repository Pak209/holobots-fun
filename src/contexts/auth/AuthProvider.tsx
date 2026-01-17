
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
  getUserProfile, 
  createUserProfile, 
  updateUserProfile, 
  searchPlayers as firestoreSearchPlayers 
} from "@/lib/firestore";
import { useNavigate } from "react-router-dom";
import { ensureWelcomeGift } from "./authUtils";
import { useRewardStore } from "@/stores/rewardStore";

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a debug mode flag for development environments
const AUTH_DEBUG = process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const navigate = useNavigate();
  const { clearUserData } = useRewardStore();

  // Helper function to log debug information
  const logDebug = (...args: any[]) => {
    if (AUTH_DEBUG) {
      console.log('[Auth Debug]', ...args);
    }
  };

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      logDebug('Fetching profile for user:', userId);
      
      const profile = await getUserProfile(userId);
      
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
  };

  // Function to handle user session
  const handleSession = async (session: any) => {
    logDebug('Handling session:', session?.user?.id || 'No session');
    
    if (!session?.user) {
      setCurrentUser(null);
      return;
    }

    try {
      const userId = session.user.id;
      const userProfile = await fetchUserProfile(userId);
      
      if (!userProfile) {
        logDebug('No profile after handling session, user may be new');
        setError("Profile not found. Please try logging out and in again.");
        return;
      }
      
      setCurrentUser(userProfile);
      setError(null);
      
      // Process welcome gift outside of critical path
      setTimeout(() => {
        ensureWelcomeGift(userId, currentUser, setCurrentUser)
          .catch(err => logDebug('Welcome gift error:', err));
      }, 0);
    } catch (err) {
      logDebug('Error in handleSession:', err);
      setError(err instanceof Error ? err.message : "Failed to load user profile");
      setCurrentUser(null);
    }
  };

  // Set up auth state management
  useEffect(() => {
    logDebug('Auth provider initialized');
    setLoading(true);
    
    // Create a flag to prevent state updates after unmount
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        logDebug('Setting up auth state listener');
        
        // Set up Firebase auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          logDebug('Auth state changed:', firebaseUser?.uid);
          
          if (!isMounted) return;
          
          if (!firebaseUser) {
            setCurrentUser(null);
            setError(null);
            clearUserData(); // Clear reward system data when signing out
            setLoading(false);
            setAuthInitialized(true);
          } else {
            // User is signed in, fetch their profile
            try {
              const userProfile = await fetchUserProfile(firebaseUser.uid);
              
              if (!userProfile) {
                logDebug('No profile found for user, may be new user');
                setError("Profile not found. Please complete registration.");
                setCurrentUser(null);
              } else {
                setCurrentUser(userProfile);
                setError(null);
                
                // Process welcome gift outside of critical path
                setTimeout(() => {
                  ensureWelcomeGift(firebaseUser.uid, userProfile, setCurrentUser)
                    .catch(err => logDebug('Welcome gift error:', err));
                }, 0);
              }
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
    };
    
    initializeAuth();
    
    return () => { isMounted = false; };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error("Login successful but no user returned");
      }
      
      logDebug('Login successful:', userCredential.user.uid);
      
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
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting logout');
      
      await signOut(auth);
      
      setCurrentUser(null);
      clearUserData(); // Clear reward system data when logging out
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
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    
    try {
      logDebug('Attempting signup for:', email);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error("Signup successful but no user returned");
      }
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, {
        username,
        email,
      });
      
      logDebug('Signup successful:', userCredential.user.uid);
      
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
  };

  // Update user function
  const updateUser = async (updates: Partial<UserProfile>): Promise<void> => {
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
      
      // Use Firestore update function
      await updateUserProfile(currentUser.id, updates);
      
      // Update the local user state with the new values
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
  };

  // Search players function
  const searchPlayers = async (query: string): Promise<UserProfile[]> => {
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
  };

  // Get user profile function
  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      logDebug('Getting user profile for:', userId);
      return await fetchUserProfile(userId);
    } catch (error) {
      logDebug('Error getting user profile:', error);
      return null;
    }
  };

  // Debug function for development use
  const debugAuth = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
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
  };

  // Create the context value
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

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
