import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

type EthereumProvider = {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (params: any) => void) => void;
  removeListener: (eventName: string, handler: (params: any) => void) => void;
  selectedAddress: string | null;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const EVMWalletLogin = ({ isLoading }: { isLoading: boolean }) => {
  const { connector: evmConnector, account } = useWeb3React();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const signInWithEVM = async () => {
    try {
      setIsAuthenticating(true);
      
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue",
          variant: "destructive",
        });
        return;
      }

      console.log("Activating Web3React connector...");
      try {
        await evmConnector.activate();
      } catch (error: any) {
        if (error.code === 4001) {
          toast({
            title: "Connection Rejected",
            description: "You rejected the connection request. Please try again and approve the connection in MetaMask.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connection Error",
            description: "Failed to connect to your wallet. Please try again.",
            variant: "destructive",
          });
        }
        console.error("Connector activation error:", error);
        setIsAuthenticating(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Generate nonce
      const nonce = `Sign in to Holobots Dapp at ${new Date().toISOString()}`;
      
      // Request signature
      console.log("Requesting signature for address:", address);
      let signature;
      try {
        signature = await signer.signMessage(nonce);
        console.log("Obtained signature:", signature);
      } catch (error: any) {
        if (error.code === 4001) {
          toast({
            title: "Signature Rejected",
            description: "You rejected the signature request. Please try again and approve the signature in MetaMask.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signature Error",
            description: "Failed to sign the message. Please try again.",
            variant: "destructive",
          });
        }
        console.error("Signature error:", error);
        setIsAuthenticating(false);
        return;
      }

      // Verify signature and create session
      const { data, error } = await supabase.functions.invoke('verify-wallet', {
        body: { 
          address, 
          nonce, 
          signature, 
          type: 'evm',
          provider: 'metamask'
        }
      });

      if (error) {
        console.error("Verification error:", error);
        toast({
          title: "Verification Failed",
          description: "Failed to verify your wallet. Please try again.",
          variant: "destructive",
        });
        setIsAuthenticating(false);
        return;
      }

      console.log("Verification response:", data);

      // Set the session in Supabase
      if (data?.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) {
          console.error("Session error:", sessionError);
          toast({
            title: "Session Error",
            description: "Failed to establish session. Please try again.",
            variant: "destructive",
          });
          setIsAuthenticating(false);
          return;
        }
        
        console.log("Session set successfully:", data.session);
        
        toast({
          title: "Success",
          description: "Successfully authenticated with EVM wallet",
        });
        
        navigate("/app");
      }
    } catch (error) {
      console.error("EVM auth error:", error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with EVM wallet",
        variant: "destructive",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      onClick={signInWithEVM}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
      disabled={isLoading || isAuthenticating}
    >
      <Wallet className="w-5 h-5" />
      {isAuthenticating ? "Connecting..." : "Connect EVM Wallet"}
    </Button>
  );
};