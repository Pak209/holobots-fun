
interface AuthHeaderProps {
  isSignUp: boolean;
}

export const AuthHeader = ({ isSignUp }: AuthHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {isSignUp ? "Create Account" : "Welcome Back"}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {isSignUp ? "Sign up to start your journey" : "Sign in to continue"}
      </p>
    </div>
  );
};
