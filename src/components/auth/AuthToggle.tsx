
import { Button } from "@/components/ui/button";

interface AuthToggleProps {
  isSignUp: boolean;
  toggleAuthMode: () => void;
  loading: boolean;
}

export function AuthToggle({ isSignUp, toggleAuthMode, loading }: AuthToggleProps) {
  return (
    <div className="mt-4 text-center">
      <Button
        variant="link"
        onClick={toggleAuthMode}
        className="text-holobots-accent hover:text-holobots-hover"
        disabled={loading}
      >
        {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
      </Button>
    </div>
  );
}
