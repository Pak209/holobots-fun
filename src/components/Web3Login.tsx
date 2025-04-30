
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Web3Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      // Set up a guest account with a random email
      const guestEmail = `guest_${Math.random().toString(36).substring(2, 11)}@example.com`;
      const guestPassword = Math.random().toString(36) + Math.random().toString(36);
      
      // Sign up the guest
      const { error } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            username: `Guest_${Math.floor(Math.random() * 10000)}`,
          }
        }
      });
      
      if (error) throw error;
      
      // Automatically sign in the guest
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });
      
      if (signInError) throw signInError;
      
      toast({
        title: "Success",
        description: "Logged in as guest successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Guest login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log in as guest",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4">
      <Button 
        onClick={handleGuestLogin}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : "Continue as Guest"}
      </Button>
    </div>
  );
};
