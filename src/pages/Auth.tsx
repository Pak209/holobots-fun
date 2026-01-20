import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  const [onboardingPath, setOnboardingPath] = useState<'owner' | 'rental' | null>('rental');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, login, signup } = useAuth();
  const from = location.state?.from?.pathname || "/dashboard";
  
  useEffect(() => {
    if (user) {
      // Check if user has holobots or has chosen a path
      const hasHolobots = user.holobots && Array.isArray(user.holobots) && user.holobots.length > 0;
      const hasRental = user.rental_holobots && Array.isArray(user.rental_holobots) && user.rental_holobots.length > 0;
      
      if (hasHolobots || hasRental) {
        // User has assets, redirect to requested page or dashboard
        navigate(from);
      } else if (user.onboardingPath === 'rental') {
        // User chose rental but hasn't received it yet? 
        // We should handle the rental assignment logic
        navigate('/dashboard');
      } else {
        // New user with no assets and no choice yet, or owner path
        navigate('/mint');
      }
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
        
        // Handle sign up through AuthProvider (which uses Firebase)
        await signup(email, password, username, onboardingPath || 'owner');

        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        });
        
        // Switch to sign in view after successful signup
        setIsSignUp(false);
        return;
      } 
      
      // Handle sign in through AuthProvider (which uses Firebase)
      await login(email, password);
      
      toast({
        title: "Login successful",
        description: "Redirecting you to the dashboard",
      });
      
      // Perform immediate navigation for better UX
      navigate(from);
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setAuthError("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/email-already-in-use') {
        setAuthError("Email is already in use. Please use a different email or sign in.");
      } else if (error.code === 'auth/weak-password') {
        setAuthError("Password is too weak. Please use a stronger password.");
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

  // Initial Onboarding Choice Screen
  if (isSignUp && !onboardingPath) {
    return (
      <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Choose Your Path
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start your journey in the Holobots universe
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Path A: Owner Path */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-holobots-accent to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-fit">
                  <Shield className="h-10 w-10 text-holobots-accent" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Own Your Holobot</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  For players ready to commit and own assets. Mint a unique Genesis Holobot NFT on-chain.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>True on-chain ownership (Base)</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                    <span>Eligible for Genesis-only rewards</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Infinity className="h-4 w-4 text-green-500 mr-2" />
                    <span>Season carryover & permanence</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Trophy className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Full marketplace trading</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requirements</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Wallet className="h-3 w-3 mr-2" />
                    <span>Wallet connection (Base / EVM)</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setOnboardingPath('owner')}
                  className="mt-8 w-full bg-holobots-accent hover:bg-holobots-hover text-white font-bold py-4 rounded-lg shadow-lg transform transition active:scale-95"
                >
                  Choose Owner Path
                </Button>
              </div>
            </div>

            {/* Path B: Rental Path */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="mb-6 bg-green-50 dark:bg-green-900/30 p-4 rounded-full w-fit">
                  <Mail className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Play Free Forever</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">
                  Play immediately with no wallet required. Get a permanent in-game rental asset you can upgrade.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Infinity className="h-4 w-4 text-green-500 mr-2" />
                    <span>1 Permanent Rental Holobot</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>Fully playable & upgradeable</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Trophy className="h-4 w-4 text-blue-500 mr-2" />
                    <span>Convert to NFT later for free</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
                    <span>Seasonal persistence (No expiry)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requirements</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Mail className="h-3 w-3 mr-2" />
                    <span>Email / OAuth only</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setOnboardingPath('rental')}
                  variant="outline"
                  className="mt-8 w-full border-2 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold py-4 rounded-lg shadow-md transform transition active:scale-95"
                >
                  Choose Free Path
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsSignUp(false);
                setAuthError(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Already have an account? Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? "Sign up to start playing Holobots for free" : "Sign in to continue"}
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
            className="w-full bg-holobots-accent hover:bg-holobots-hover text-white py-2 rounded-md"
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
              // Keep onboardingPath as 'rental' for free-to-play
              setOnboardingPath('rental');
              setAuthError(null);
            }}
            className="text-blue-600 dark:text-holobots-accent hover:underline"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">Debug Info</summary>
              <div className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto">
                <p>Current Path: {location.pathname}</p>
                <p>Redirect After Login: {from}</p>
                <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
                <p>Form Loading: {loading ? 'true' : 'false'}</p>
                <p>Auth Error: {authError || 'none'}</p>
                <p>Path: {onboardingPath || 'none'}</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
