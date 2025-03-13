
import { useEffect } from "react";
import { useAuthForm } from "@/hooks/useAuthForm";
import { SignUpFields } from "@/components/auth/SignUpFields";
import { AuthFormFields } from "@/components/auth/AuthFormFields";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { SocialLoginOptions } from "@/components/auth/SocialLoginOptions";
import { AuthToggle } from "@/components/auth/AuthToggle";
import { AuthLoading } from "@/components/auth/AuthLoading";

export default function Auth() {
  const {
    emailOrUsername,
    setEmailOrUsername,
    password,
    setPassword,
    username,
    setUsername,
    isSignUp,
    loading,
    checkingSession,
    handleAuth,
    toggleAuthMode,
    checkSession
  } = useAuthForm();

  // Check if user is already logged in
  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (checkingSession) {
        console.log("Session check timeout - forcing state update");
        setCheckingSession(false);
      }
    }, 5000);
    
    checkSession();
    
    return () => clearTimeout(timeoutId);
  }, [checkSession]);

  // Show loading indicator while checking session
  if (checkingSession) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-holobots-text dark:text-holobots-dark-text">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-holobots-text/60 dark:text-holobots-dark-text/60">
            {isSignUp ? "Sign up to start your journey" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <SignUpFields 
              username={username} 
              setUsername={setUsername} 
              loading={loading} 
            />
          )}
          
          <AuthFormFields
            emailOrUsername={emailOrUsername}
            setEmailOrUsername={setEmailOrUsername}
            password={password}
            setPassword={setPassword}
            isSignUp={isSignUp}
            loading={loading}
          />

          <AuthSubmitButton isSignUp={isSignUp} loading={loading} />
        </form>

        <SocialLoginOptions loading={loading} />

        <AuthToggle 
          isSignUp={isSignUp} 
          toggleAuthMode={toggleAuthMode} 
          loading={loading} 
        />
      </div>
    </div>
  );
}
