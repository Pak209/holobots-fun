import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrowserProvider } from "ethers";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (params: any) => void) => void;
  removeListener: (eventName: string, handler: (params: any) => void) => void;
  selectedAddress: string | null;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const EVMWalletLogin = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Metamask not found",
        description: "Please install Metamask to continue",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAuthenticating(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const signer = await provider.getSigner();
      const message = "Sign this message to verify your identity";
      const signature = await signer.signMessage(message);

      if (signature) {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      onClick={connectWallet}
      disabled={isAuthenticating}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isAuthenticating ? "Connecting..." : "Connect EVM Wallet"}
    </Button>
  );
};