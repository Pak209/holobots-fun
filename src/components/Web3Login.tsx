
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Web3ModalLogin } from "@/components/auth/Web3ModalLogin";
import { SolanaWalletLogin } from "@/components/auth/SolanaWalletLogin";
import { Wallet, AlertTriangle } from "lucide-react";

export const Web3Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleError = (error: any) => {
    console.error("Web3 login error:", error);
    setShowError(true);
    setIsLoading(false);
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      {showError && (
        <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-md flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span>There was an error connecting to your wallet. Please try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <Web3ModalLogin 
          isLoading={isLoading} 
          onStart={() => {
            setIsLoading(true);
            setShowError(false);
          }}
          onError={handleError}
          onSuccess={() => setIsLoading(false)}
        />
        
        <SolanaWalletLogin 
          isLoading={isLoading}
          onStart={() => {
            setIsLoading(true);
            setShowError(false);
          }}
          onError={handleError}
          onSuccess={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};
