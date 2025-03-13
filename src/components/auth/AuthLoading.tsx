
import { Loader2 } from "lucide-react";

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-holobots-accent" />
        <p className="text-holobots-text dark:text-holobots-dark-text">Checking authentication...</p>
      </div>
    </div>
  );
}
