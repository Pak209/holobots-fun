import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

const EVMWalletLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

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
      setIsLoading(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts[0]) {
        const message = `Welcome to Holobots!\nPlease sign this message to verify your wallet ownership.\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address: ${accounts[0]}\nTimestamp: ${Date.now()}`;
        
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, accounts[0]],
        });

        await login(accounts[0], signature, message);
        navigate("/app");
      }
    } catch (error: any) {
      toast({
        title: "Error connecting wallet",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={connectWallet}
      disabled={isLoading}
      className="bg-holobots-accent hover:bg-holobots-hover text-white"
    >
      {isLoading ? "Connecting..." : "Connect MetaMask"}
    </Button>
  );
};

export default EVMWalletLogin;