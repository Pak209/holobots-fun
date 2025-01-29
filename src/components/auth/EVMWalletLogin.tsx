import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

export const EVMWalletLogin = ({ isLoading }: { isLoading: boolean }) => {
  const { connector: evmConnector } = useWeb3React();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signInWithEVM = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "Error",
          description: "MetaMask is not installed!",
          variant: "destructive",
        });
        return;
      }

      await evmConnector.activate();
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Generate nonce
      const nonce = `Sign in to Holobots Dapp at ${new Date().toISOString()}`;
      const signature = await signer.signMessage(nonce);

      // Verify signature and create session
      const { data, error } = await supabase.functions.invoke('verify-wallet', {
        body: { address, nonce, signature, type: 'evm' }
      });

      if (error) throw error;

      // Set the session in Supabase
      if (data?.session) {
        const { data: { session }, error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
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
    }
  };

  return (
    <Button
      onClick={signInWithEVM}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
      disabled={isLoading}
    >
      <Wallet className="w-5 h-5" />
      Connect EVM Wallet
    </Button>
  );
};