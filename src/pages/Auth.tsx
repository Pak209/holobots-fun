
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An error occurred during authentication",
        variant: "destructive",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // For signup, we always require an email
        if (!emailOrUsername.includes('@')) {
          throw new Error("Please provide a valid email address for signup");
        }

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
          // Create profile with initial values
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: signUpData.user.id,
                username,
                daily_energy: 100,
                max_daily_energy: 100,
                holos_tokens: null,
                gacha_tickets: 0,
                wins: 0,
                losses: 0,
                last_energy_refresh: new Date().toISOString(),
              },
            ]);

          if (profileError) throw profileError;

          toast({
            title: "Account created!",
            description: "Please proceed to mint your first Holobot.",
          });

          navigate('/mint');
        }
      } else {
        // For login, check if input is email or username
        let email = emailOrUsername;
        
        if (!emailOrUsername.includes('@')) {
          // If username provided, get the corresponding email
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', emailOrUsername)
            .single();

          if (profileError || !profile) {
            throw new Error("Username not found");
          }

          // Get user's email from auth.users
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', profile.id)
            .single();

          if (userError || !userData?.email) {
            throw new Error("Error retrieving user data");
          }

          email = userData.email;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('holos_tokens')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.holos_tokens === null) {
              navigate('/mint');
            } else {
              navigate('/');
            }
          } else {
            throw new Error("Profile not found");
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-holobots-accent hover:bg-holobots-hover"
            disabled={loading}
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-holobots-background dark:bg-holobots-dark-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-holobots-accent hover:text-holobots-hover"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
