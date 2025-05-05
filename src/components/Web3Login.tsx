
import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

export const Web3Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        const result = await register(email, password);
        if (result) {
          toast({
            title: "Registration successful",
            description: "Please check your email for verification instructions.",
          });
        }
      } else {
        const result = await login(email, password);
        if (result) {
          toast({
            title: "Login successful",
            description: "You are now logged in.",
          });
        }
      }
    } catch (err: any) {
      toast({
        title: "Authentication error",
        description: err.message || "Failed to authenticate",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-holobots-card rounded-lg shadow-md border border-holobots-border">
      <h2 className="text-2xl font-bold mb-6 text-center text-holobots-text">
        {isRegistering ? "Create Account" : "Login to Holobots"}
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-holobots-accent hover:bg-holobots-hover" 
          disabled={loading}
        >
          {loading ? "Processing..." : isRegistering ? "Register" : "Login"}
        </Button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-holobots-accent hover:underline text-sm"
        >
          {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
        </button>
      </div>
    </div>
  );
};
