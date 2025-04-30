
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  loading?: boolean;
  onToggleMode: () => void;
}

export const SignInForm = ({ loading, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      
      // Auth redirect handled by Auth.tsx useEffect
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-xs text-blue-500 hover:underline">
            Forgot password?
          </a>
        </div>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" 
          required 
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-holobots-accent hover:bg-holobots-hover"
        disabled={isSubmitting || loading}
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
      
      <div className="text-center text-sm">
        Don't have an account?{" "}
        <button 
          type="button"
          onClick={onToggleMode}
          className="text-blue-500 hover:underline"
        >
          Sign Up
        </button>
      </div>
    </form>
  );
};

export const SignUpForm = ({ loading, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
      
      // Switch to sign in mode
      onToggleMode();
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input 
          id="username" 
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input 
          id="signup-password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" 
          required 
        />
        <p className="text-xs text-gray-500">
          Must be at least 6 characters.
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-holobots-accent hover:bg-holobots-hover"
        disabled={isSubmitting || loading}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>
      
      <div className="text-center text-sm">
        Already have an account?{" "}
        <button 
          type="button"
          onClick={onToggleMode}
          className="text-blue-500 hover:underline"
        >
          Sign In
        </button>
      </div>
    </form>
  );
};
