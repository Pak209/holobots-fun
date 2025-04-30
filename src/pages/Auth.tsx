
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Web3Login } from "@/components/Web3Login";
import { Separator } from "@/components/ui/separator";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignInForm, SignUpForm } from "@/components/auth/AuthForms";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    
    checkSession();
  }, [navigate]);

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <AuthHeader isSignUp={isSignUp} />

        <Web3Login />
        
        <div className="my-6 flex items-center">
          <Separator className="flex-1" />
          <span className="mx-4 text-sm text-gray-500">OR</span>
          <Separator className="flex-1" />
        </div>

        {isSignUp ? (
          <SignUpForm 
            onToggleMode={toggleAuthMode} 
          />
        ) : (
          <SignInForm 
            onToggleMode={toggleAuthMode} 
          />
        )}
      </div>
    </div>
  );
}
