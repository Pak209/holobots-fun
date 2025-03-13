
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useAuthForm() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkSession = async () => {
    try {
      setCheckingSession(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("User is already logged in, checking profile data");
        // Check if the user has holobots before redirecting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('holobots')
          .eq('id', data.session.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // Continue with the auth page if there's an error fetching the profile
          setCheckingSession(false);
          return;
        }
        
        // If user has holobots, redirect to dashboard, otherwise to mint page
        if (profile && profile.holobots && Array.isArray(profile.holobots) && profile.holobots.length > 0) {
          navigate('/dashboard');
        } else {
          navigate('/mint');
        }
      } else {
        console.log("No active session found");
        setCheckingSession(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setCheckingSession(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!emailOrUsername.includes('@')) {
          throw new Error("Please provide a valid email address for signup");
        }

        // Use the official Supabase method for sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: emailOrUsername,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          toast({
            title: "Account created!",
            description: "Please proceed to mint your first Holobot.",
          });
          
          // Ensure loading is false before redirect
          setLoading(false);
          
          // Redirect to mint page after signup
          navigate('/mint');
          return; // Early return after successful navigation
        }
      } else {
        // Login logic
        let loginEmail = emailOrUsername;

        // If input is not an email, try to find the associated email
        if (!emailOrUsername.includes('@')) {
          console.log("Attempting to login with username:", emailOrUsername);
          
          // Use a custom login approach for usernames
          loginEmail = `${emailOrUsername.toLowerCase()}@holobots.com`;
          console.log("Using generated email for login:", loginEmail);
        }

        console.log("Attempting login with email:", loginEmail);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

        if (error) {
          console.error("Login error:", error);
          throw error;
        }

        toast({
          title: "Login successful",
          description: "Redirecting you to the dashboard",
        });

        // Ensure loading is false before redirect
        setLoading(false);

        // Check if the user has holobots before redirecting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('holobots')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile after login:", profileError);
          // Default to mint page if there's an error
          navigate('/mint');
          return;
        }
        
        // If user has holobots, redirect to dashboard, otherwise to mint page
        if (profile && profile.holobots && Array.isArray(profile.holobots) && profile.holobots.length > 0) {
          navigate('/dashboard');
        } else {
          navigate('/mint');
        }
        return; // Early return after successful navigation
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Ensure loading state is reset even on error
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    username,
    setUsername,
    isSignUp,
    loading,
    checkingSession,
    setCheckingSession,
    handleAuth,
    toggleAuthMode,
    checkSession,
  };
}
