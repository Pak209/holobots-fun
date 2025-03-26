
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Mail, Lock } from "lucide-react";
import { clearStaleAuthSessions, refreshTokenIfNeeded } from "@/contexts/auth/authUtils";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check if user is already signed in
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        // Clear any stale auth sessions
        await clearStaleAuthSessions();
        
        // Check for active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Refresh token if needed
          await refreshTokenIfNeeded();
          
          // Navigate to dashboard if session exists
          toast({
            description: "You're already logged in! Redirecting...",
          });
          
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate, toast]);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Use demo account for quicker sign in
      const demoEmail = "demo@holobots.com";
      const demoPassword = "demo123";
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email || demoEmail,
        password: password || demoPassword
      });
      
      if (error) {
        throw error;
      }
      
      // Successful login
      toast({
        description: "Logged in successfully!",
      });
      
      // Small delay to allow auth state to update
      setTimeout(() => {
        navigate("/dashboard");
      }, 300);
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Retry login if failed
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Connection issue",
          description: "Retrying login...",
        });
        
        // Wait a bit and retry
        setTimeout(() => {
          handleSignIn();
        }, 1000);
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Login with demo account
    setEmail("demo@holobots.com");
    setPassword("demo123");
    handleSignIn();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-holobots-dark-background to-holobots-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/holobots-logo.svg" alt="Holobots" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Login to Holobots</h1>
          <p className="text-gray-400 mt-2">Enter your credentials to access your account</p>
        </div>
        
        <div className="bg-holobots-card border border-holobots-border/20 rounded-lg p-6 shadow-lg">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-holobots-background border-holobots-border/30"
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-holobots-background border-holobots-border/30"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-holobots-accent hover:bg-holobots-accent/80"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400 mb-2">Or use demo account</p>
            <Button
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full border-holobots-accent/50 text-holobots-accent"
              disabled={isLoading}
            >
              Demo Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
