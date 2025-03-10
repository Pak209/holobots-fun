
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
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

        console.log("Login successful, user:", data.user.id);
        
        toast({
          title: "Login successful",
          description: "Redirecting you to the dashboard",
        });

        // Check if the user has holobots before redirecting
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('holobots')
          .eq('id', data.user.id)
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
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An error occurred during authentication",
        variant: "destructive",
      });
      setLoading(false);
    }
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
                disabled={loading}
                className="w-full"
                placeholder="Choose a username"
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
              disabled={loading}
              className="w-full"
              placeholder={isSignUp ? "Enter your email" : "Enter your email or username"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-holobots-accent hover:bg-holobots-hover"
            disabled={loading}
          >
            {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={loading}
            className="text-holobots-accent hover:text-holobots-hover"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
