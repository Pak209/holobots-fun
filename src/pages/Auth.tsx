import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationMenu } from "@/components/NavigationMenu";
import { useToast } from "@/hooks/use-toast";
import { EVMWalletLogin } from "@/components/auth/EVMWalletLogin";
import { SolanaWalletLogin } from "@/components/auth/SolanaWalletLogin";
import { Web3ModalLogin } from "@/components/auth/Web3ModalLogin";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { login, signup, loading, error, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status and redirect if already logged in
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log("Checking auth state:", { user, loading });
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (session || user) {
          console.log("User is authenticated, redirecting to /");
          navigate("/", { replace: true });
          return;
        }
      } catch (err) {
        console.error("Error checking auth state:", err);
      }
    };

    checkAuthAndRedirect();
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        console.log("Attempting login with:", { email });
        await login(email, password);
      } else {
        console.log("Attempting signup with:", { email, username });
        await signup(email, password, username);
      }
      
      // Show success message
      toast({
        title: isLogin ? "Welcome back!" : "Account created successfully!",
        description: isLogin ? 
          "You are now logged in." : 
          "Please check your email for confirmation instructions.",
      });
      
      // Only navigate after login, not after signup since email confirmation might be required
      if (isLogin) {
        navigate("/", { replace: true });
      }
      
    } catch (err) {
      console.error("Auth error:", err);
      
      // More descriptive error messages
      let errorMessage = "An error occurred during authentication";
      if (err instanceof Error) {
        const errorString = err.message.toLowerCase();
        if (errorString.includes("email_not_confirmed")) {
          errorMessage = "Please check your email and confirm your account before logging in";
        } else if (errorString.includes("invalid_credentials")) {
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

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center">
        <div className="text-holobots-text dark:text-holobots-dark-text animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // If already authenticated, don't render the form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background">
      <NavigationMenu />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg p-6 shadow-neon-border">
            <h1 className="text-2xl font-bold mb-6 text-holobots-text dark:text-holobots-dark-text">
              {isLogin ? "Login" : "Create Account"}
            </h1>
            
            <div className="space-y-4">
              <EVMWalletLogin isLoading={loading} />
              <SolanaWalletLogin isLoading={loading} />
              <Web3ModalLogin isLoading={loading} />
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-holobots-border dark:border-holobots-dark-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-holobots-card dark:bg-holobots-dark-card px-2 text-holobots-text dark:text-holobots-dark-text">
                  Or continue with email
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
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
                    className="w-full"
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
                  className="w-full"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : (isLogin ? "Login" : "Sign Up")}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-holobots-accent dark:text-holobots-dark-accent hover:underline"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}