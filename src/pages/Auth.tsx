import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Shield, Zap, Sparkles, Infinity, Trophy, Wallet, Mail } from "lucide-react";
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
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-black border-4 border-[#F5C400] p-8 shadow-[0_0_30px_rgba(245,196,0,0.5)]" style={{
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}>
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-[#F5C400] mb-4" />
          <p className="text-[#F5C400] font-black uppercase tracking-widest">Initializing...</p>
        </div>
      </div>
    );
  }

  // Initial Onboarding Choice Screen
  if (isSignUp && !onboardingPath) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-black border-4 border-[#F5C400] shadow-[0_0_30px_rgba(245,196,0,0.5)] p-6 sm:p-8" style={{
          clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
        }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F5C400] to-[#D4A400] p-4 mb-8" style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-2 uppercase tracking-widest text-center">
              Choose Your Path
            </h1>
            <p className="text-base sm:text-lg text-black font-bold uppercase tracking-wide text-center">
              Start your journey in the Holobots universe
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Path A: Owner Path */}
            <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-[#F5C400] p-6 hover:shadow-[0_0_25px_rgba(245,196,0,0.6)] transition-all duration-300" style={{
              clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
            }}>
              <div className="flex flex-col h-full">
                <div className="mb-4 bg-[#F5C400]/20 p-3 w-fit border-2 border-[#F5C400]" style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}>
                  <Shield className="h-8 w-8 text-[#F5C400]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#F5C400] mb-2 uppercase tracking-wider">Own Your Holobot</h3>
                <p className="text-gray-300 text-sm mb-6 flex-grow">
                  For players ready to commit and own assets. Mint a unique Genesis Holobot NFT on-chain.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Zap className="h-4 w-4 text-[#F5C400] mr-2 flex-shrink-0" />
                    <span>True on-chain ownership (Base)</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Sparkles className="h-4 w-4 text-[#F5C400] mr-2 flex-shrink-0" />
                    <span>Eligible for Genesis-only rewards</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Infinity className="h-4 w-4 text-[#F5C400] mr-2 flex-shrink-0" />
                    <span>Season carryover & permanence</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Trophy className="h-4 w-4 text-[#F5C400] mr-2 flex-shrink-0" />
                    <span>Full marketplace trading</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6 border-t-2 border-[#F5C400]/30 pt-4">
                  <p className="text-xs font-black text-[#F5C400] uppercase tracking-wider mb-2">Requirements</p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Wallet className="h-3 w-3 mr-2" />
                    <span>Wallet connection (Base / EVM)</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setOnboardingPath('owner')}
                  className="mt-auto w-full bg-[#F5C400] hover:bg-[#D4A400] text-black font-black py-3 uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(245,196,0,0.5)] transition-all"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                  }}
                >
                  Choose Owner Path
                </Button>
              </div>
            </div>

            {/* Path B: Rental Path */}
            <div className="bg-gradient-to-br from-gray-900 to-black border-4 border-green-500 p-6 hover:shadow-[0_0_25px_rgba(34,197,94,0.6)] transition-all duration-300" style={{
              clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
            }}>
              <div className="flex flex-col h-full">
                <div className="mb-4 bg-green-500/20 p-3 w-fit border-2 border-green-500" style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}>
                  <Mail className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-green-400 mb-2 uppercase tracking-wider">Play Free Forever</h3>
                <p className="text-gray-300 text-sm mb-6 flex-grow">
                  Play immediately with no wallet required. Get a permanent in-game rental asset you can upgrade.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Infinity className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>1 Permanent Rental Holobot</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Zap className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Fully playable & upgradeable</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Trophy className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Convert to NFT later for free</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-white">
                    <Sparkles className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>Seasonal persistence (No expiry)</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6 border-t-2 border-green-500/30 pt-4">
                  <p className="text-xs font-black text-green-400 uppercase tracking-wider mb-2">Requirements</p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Mail className="h-3 w-3 mr-2" />
                    <span>Email / OAuth only</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setOnboardingPath('rental')}
                  className="mt-auto w-full bg-green-600/80 hover:bg-green-700 text-white font-black py-3 uppercase tracking-widest border-3 border-green-800 shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                  }}
                >
                  Choose Free Path
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(false);
                setAuthError(null);
              }}
              className="text-[#F5C400] hover:text-white font-bold uppercase tracking-wide text-sm transition-colors"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black border-4 border-[#F5C400] shadow-[0_0_30px_rgba(245,196,0,0.5)] p-6" style={{
        clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
      }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F5C400] to-[#D4A400] p-4 mb-6" style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
        }}>
          <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-widest text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-black font-bold uppercase tracking-wide text-center text-sm">
            {isSignUp ? "Start playing Holobots for free" : "Sign in to continue"}
          </p>
        </div>

        {authError && (
          <div className="bg-red-900/30 border-2 border-red-500 p-3 mb-4 flex items-start" style={{
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
          }}>
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{authError}</p>
          </div>
        )}


        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="username" className="block text-sm font-black text-[#F5C400] mb-2 uppercase tracking-wider">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={isSignUp}
                className="w-full bg-black border-2 border-[#F5C400] text-white placeholder-gray-500 focus:ring-[#F5C400] focus:border-[#D4A400] p-3"
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="block text-sm font-black text-[#F5C400] mb-2 uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border-2 border-[#F5C400] text-white placeholder-gray-500 focus:ring-[#F5C400] focus:border-[#D4A400] p-3"
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-black text-[#F5C400] mb-2 uppercase tracking-wider">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border-2 border-[#F5C400] text-white placeholder-gray-500 focus:ring-[#F5C400] focus:border-[#D4A400] p-3"
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
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
                className="border-[#F5C400] data-[state=checked]:bg-[#F5C400] data-[state=checked]:text-black"
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm font-bold leading-none cursor-pointer text-white uppercase tracking-wide"
              >
                Remember me
              </Label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#F5C400] hover:bg-[#D4A400] text-black font-black py-4 uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(245,196,0,0.5)] transition-all mt-6"
            style={{
              clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
            }}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              // Keep onboardingPath as 'rental' for free-to-play
              setOnboardingPath('rental');
              setAuthError(null);
            }}
            className="text-[#F5C400] hover:text-white font-bold uppercase tracking-wide text-sm transition-colors"
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </button>
        </div>
        
        {import.meta.env.MODE === 'development' && (
          <div className="mt-6 border-t-2 border-[#F5C400]/30 pt-4">
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-[#F5C400] font-bold uppercase tracking-wide">Debug Info</summary>
              <div className="mt-2 bg-gray-900/50 border border-[#F5C400]/30 p-2 overflow-auto font-mono">
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
