
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

// Define the Ethereum provider interface
interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
  };
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

export const EVMWalletLogin = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const message = `Login to Holobots\nNonce: ${Date.now()}`;
      const signature = await window.ethereum.request({ 
        method: "personal_sign",
        params: [message, accounts[0]]
      });

      await login(accounts[0], signature);

      toast({
        title: "Connected successfully",
        description: "Your wallet has been connected",
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={connectWallet}
      disabled={isConnecting}
      className="w-full bg-holobots-accent hover:bg-holobots-hover text-white"
    >
      {isConnecting ? "Connecting..." : "Connect MetaMask"}
    </Button>
  );
};
