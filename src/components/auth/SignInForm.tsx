
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignInFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: (userId: string) => Promise<void>;
}

export default function SignInForm({ loading, setLoading, onSuccess }: SignInFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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

      await onSuccess(data.user.id);
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

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Email or Username
        </label>
        <Input
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          disabled={loading}
          className="w-full"
          placeholder="Enter your email or username"
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
        {loading ? "Please wait..." : "Sign In"}
      </Button>
    </form>
  );
}
