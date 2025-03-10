
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSuccess: () => void;
}

export default function SignUpForm({ loading, setLoading, onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email.includes('@')) {
        throw new Error("Please provide a valid email address for signup");
      }

      // Use the official Supabase method for sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        toast({
          title: "Account created!",
          description: "Please proceed to mint your first Holobot.",
        });
        
        // Call the success handler
        onSuccess();
      }
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
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
          className="w-full"
          placeholder="Choose a username"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full"
          placeholder="Enter your email"
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
        {loading ? "Please wait..." : "Create Account"}
      </Button>
    </form>
  );
}
