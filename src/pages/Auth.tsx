
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Web3ModalLogin } from "@/components/auth/Web3ModalLogin";
import { SolanaWalletLogin } from "@/components/auth/SolanaWalletLogin";

export default function Auth() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
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
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (checkingSession) {
        console.log("Session check timeout - forcing state update");
        setCheckingSession(false);
      }
    }, 5000);
    
    checkSession();
    
    return () => clearTimeout(timeoutId);
  }, [navigate]);

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
          
          // Redirect to mint page after signup
          navigate('/mint');
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
        return; // Exit early after successful navigation
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

  // Show loading indicator while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-holobots-accent" />
          <p className="text-holobots-text dark:text-holobots-dark-text">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-holobots-text dark:text-holobots-dark-text">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">
            {isSignUp ? "Sign up to start your journey" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">
              {isSignUp ? "Email" : "Email or Username"}
            </label>
            <Input
              type={isSignUp ? "email" : "text"}
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              className="w-full"
              placeholder={isSignUp ? "Enter your email" : "Enter your email or username"}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your password"
              minLength={6}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-holobots-accent hover:bg-holobots-hover"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-300 dark:border-gray-700 w-full"></div>
            <div className="px-2 text-sm text-gray-500 dark:text-gray-400 bg-holobots-background dark:bg-holobots-dark-background">or continue with</div>
            <div className="border-t border-gray-300 dark:border-gray-700 w-full"></div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Web3ModalLogin isLoading={loading} />
          <SolanaWalletLogin isLoading={loading} />
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-holobots-accent hover:text-holobots-hover"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
