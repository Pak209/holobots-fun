
import { createContext, useContext, useState, useEffect } from "react";
import { Session, User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface AuthSessionContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthSessionContext = createContext<AuthSessionContextType>({
  session: null,
  user: null,
  loading: true
});

export function useAuthSession() {
  return useContext(AuthSessionContext);
}

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST (as recommended by Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event);
      
      // Update our state
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // No need for async operations here which could cause deadlocks
    });
    
    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading
  };

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}
