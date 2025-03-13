
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AuthSubmitButtonProps {
  isSignUp: boolean;
  loading: boolean;
}

export function AuthSubmitButton({ isSignUp, loading }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="w-full bg-holobots-accent hover:bg-holobots-hover"
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Processing...</span>
        </div>
      ) : isSignUp ? "Create Account" : "Sign In"}
    </Button>
  );
}
