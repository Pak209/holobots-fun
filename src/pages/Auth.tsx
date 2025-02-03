import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useToast } from "@/hooks/use-toast";
import { Web3Login } from "@/components/Web3Login";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { login, signup, loading: authLoading, error, user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // If user is already authenticated, redirect
        if (user) {
          navigate("/app");
          return;
        }

        // Try to get session, but don't block if Supabase is unavailable
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            navigate("/app");
          }
        } catch (err) {
          console.error("Supabase auth check failed:", err);
          // Don't show error toast since Supabase is intentionally disconnected
        }
      } finally {
        // Always set isChecking to false to prevent infinite loading
        setIsChecking(false);
      }
    };

    // Set a timeout to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      setIsChecking(false);
    }, 3000); // 3 second timeout

    checkAuthAndRedirect();

    // Cleanup timeout
    return () => clearTimeout(timeoutId);
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!username) {
          toast({
            title: "Username Required",
            description: "Please enter a username to create your account.",
            variant: "destructive",
          });
          return;
        }
        await signup(email, password, username);
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account before logging in.",
        });
        setIsLogin(true);
      }
    } catch (err) {
      console.error("Auth error:", err);
      
      let errorMessage = "An error occurred during authentication";
      if (err instanceof Error) {
        const errorString = err.message.toLowerCase();
        if (errorString.includes("invalid_credentials")) {
          errorMessage = "Invalid email or password";
        } else if (errorString.includes("already exists")) {
          errorMessage = "This email is already registered";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isChecking || authLoading) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
        <NavigationMenu />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-holobots-background">
      <NavigationMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="neo-blur rounded-lg p-8 shadow-lg space-y-6">
            <h1 className="text-2xl font-bold mb-6 text-gradient">
              {isLogin ? "Login" : "Create Account"}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/30 border-holobots-border text-holobots-text placeholder:text-gray-400"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-black/30 border-holobots-border text-holobots-text placeholder:text-gray-400"
                  />
                </div>
              )}
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/30 border-holobots-border text-holobots-text placeholder:text-gray-400"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-holobots-accent hover:bg-holobots-hover text-white"
                disabled={authLoading}
              >
                {authLoading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-holobots-accent hover:text-holobots-hover transition-colors"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-holobots-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-holobots-card px-2 text-holobots-text">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Web3Login isLoading={authLoading} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}