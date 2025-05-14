import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  // Extract redirect path from location state
  const from = location.state?.from?.pathname || "/dashboard";
  
  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(from);
    }
  }, [user, navigate, from]);

  // Handle auth (sign up or sign in)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        // Email validation
        if (!email.includes('@')) {
          setAuthError("Please enter a valid email address");
          setLoading(false);
          return;
        }
        
        // Password validation
        if (password.length < 6) {
          setAuthError("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }
        
        // Username validation
        if (username.length < 3) {
          setAuthError("Username must be at least 3 characters long");
          setLoading(false);
          return;
        }
        
        // Handle sign up through AuthProvider
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          }
        });

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account, then sign in.",
        });
        
        // Switch to sign in view after successful signup
        setIsSignUp(false);
        return;
      } 
      
      // Handle sign in through AuthProvider
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (session) {
        toast({
          title: "Login successful",
          description: "Redirecting you to the dashboard",
        });
        
        // Navigating to dashboard will happen through the useEffect above
        // when the AuthProvider updates the user state
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Email not confirmed')) {
        setAuthError("Please check your email and confirm your account before signing in.");
      } else if (error.message?.includes('Invalid login credentials')) {
        setAuthError("Invalid email or password. Please try again.");
      } else {
        setAuthError(error.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state if auth is still being initialized
  if (authLoading) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-holobots-accent mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? "Sign up to start your journey" : "Sign in to continue"}
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-300">{authError}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              minLength={6}
              disabled={loading}
            />
          </div>

          {!isSignUp && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe} 
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setRememberMe(checked);
                  }
                }}
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-gray-700 dark:text-gray-300"
              >
                Remember me
              </Label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-holobots-dark-accent dark:hover:bg-holobots-dark-accent/90 text-white dark:text-gray-900 py-2 rounded-md"
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

        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError(null);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Debug Info</summary>
              <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto">
                <p>Current Path: {location.pathname}</p>
                <p>Redirect After Login: {from}</p>
                <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
                <p>Form Loading: {loading ? 'true' : 'false'}</p>
                <p>Auth Error: {authError || 'none'}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
