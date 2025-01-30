import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

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
          title: "Error",
          description: "MetaMask is not installed!",
          variant: "destructive",
        });
        return;
      }

      // Activate Web3React connector
      await evmConnector.activate();
      
      // Wait for account to be available
      if (!account) {
        throw new Error("No account available after connection");
      }

      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Generate nonce
      const nonce = `Sign in to Holobots Dapp at ${new Date().toISOString()}`;
      
      // Request signature
      console.log("Requesting signature for address:", address);
      const signature = await signer.signMessage(nonce);
      console.log("Obtained signature:", signature);

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
        throw error;
      }

      console.log("Verification response:", data);

      // Set the session in Supabase
      if (data?.session) {
        const { data: { session }, error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
        
        console.log("Session set successfully:", session);
      }

      toast({
        title: "Success",
        description: "Successfully authenticated with EVM wallet",
      });
      
      navigate("/");
    } catch (error) {
      console.error("EVM auth error:", error);
      toast({
        title: "Error",
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