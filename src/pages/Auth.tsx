
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth, useAuthSession } from "@/contexts/auth";
import { Web3Login } from "@/components/Web3Login";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { session } = useAuthSession();

  // Check if user is already logged in
  useEffect(() => {
    if (user || session) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, session, navigate]);

  // Handle auth (sign up or sign in)
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Basic validation
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        await signup();
      } else {
        await login();
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
  
  const login = async () => {
    const { login } = useAuth();
    await login(email, password);
    // No need to navigate - AuthProvider handles redirection
  };
  
  const signup = async () => {
    const { signup } = useAuth();
    await signup(email, password, username);
    
    // Switch to sign in view after successful signup
    setIsSignUp(false);
    toast({
      title: "Account created!",
      description: "Please check your email to verify your account, then sign in.",
    });
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? "Sign up to start your journey" : "Sign in to continue"}
          </p>
        </div>

        <Tabs defaultValue="email" className="mb-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="web3">Web3 Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
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
                    className="w-full"
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
                  className="w-full"
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
                  className="w-full"
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : isSignUp ? "Create Account" : "Sign In"}
              </Button>
              
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                disabled={loading}
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="web3">
            <div className="py-2">
              <Web3Login isLoading={loading} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
