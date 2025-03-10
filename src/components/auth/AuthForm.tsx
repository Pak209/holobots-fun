
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { supabase } from "@/integrations/supabase/client";

interface AuthFormProps {
  onSignInSuccess: (userId: string) => Promise<void>;
  onSignUpSuccess: () => void;
}

export default function AuthForm({ onSignInSuccess, onSignUpSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-holobots-text dark:text-holobots-dark-text">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">
          {isSignUp ? "Sign up to start your journey" : "Sign in to continue"}
        </p>
      </div>

      {isSignUp ? (
        <SignUpForm 
          loading={loading}
          setLoading={setLoading}
          onSuccess={onSignUpSuccess}
        />
      ) : (
        <SignInForm 
          loading={loading}
          setLoading={setLoading}
          onSuccess={onSignInSuccess}
        />
      )}

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={loading}
          className="text-holobots-accent hover:text-holobots-hover"
        >
          {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
        </Button>
      </div>
    </div>
  );
}
