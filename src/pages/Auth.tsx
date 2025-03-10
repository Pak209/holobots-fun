
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";

export default function Auth() {
  const [initialChecking, setInitialChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Session check on Auth page:", data.session ? "User is logged in" : "No session");
        
        if (data.session) {
          // User is logged in, check if they have holobots
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('holobots')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching profile:", error);
            setInitialChecking(false);
            return;
          }
          
          // If user has holobots, redirect to dashboard, otherwise to mint page
          if (profile && profile.holobots && Array.isArray(profile.holobots) && profile.holobots.length > 0) {
            console.log("User has holobots, redirecting to dashboard");
            navigate('/dashboard');
          } else {
            console.log("User has no holobots, redirecting to mint page");
            navigate('/mint');
          }
        } else {
          setInitialChecking(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setInitialChecking(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Handler for successful sign-in
  const handleSignInSuccess = async (userId: string) => {
    try {
      // Check if the user has holobots before redirecting
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('holobots')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Instead of stopping here, we'll redirect to mint since that's the default for new users
        navigate('/mint');
        return;
      }
      
      // If user has holobots, redirect to dashboard, otherwise to mint page
      if (profile && profile.holobots && Array.isArray(profile.holobots) && profile.holobots.length > 0) {
        console.log("User has holobots, redirecting to dashboard");
        navigate('/dashboard');
      } else {
        console.log("User has no holobots, redirecting to mint page");
        navigate('/mint');
      }
    } catch (error) {
      console.error('Navigation error after sign-in:', error);
      // Fallback to mint page on error
      navigate('/mint');
    }
  };

  // Handler for successful sign-up
  const handleSignUpSuccess = () => {
    // Redirect to mint page after signup
    navigate('/mint');
  };

  // If we're still checking the initial session, show a loading state
  if (initialChecking) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-holobots-text dark:text-holobots-dark-text mb-4">
            Loading...
          </h2>
          <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">
            Please wait while we check your session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <AuthForm 
        onSignInSuccess={handleSignInSuccess}
        onSignUpSuccess={handleSignUpSuccess}
      />
    </div>
  );
}
