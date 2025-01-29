import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

export const Web3Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { connector: evmConnector } = useWeb3React();
  const { connect: connectSolana, wallet: solanaWallet } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signInWithEVM = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithSolana = async () => {
    try {
      setIsLoading(true);
      if (!solanaWallet) {
        await connectSolana();
        return;
      }

      const provider = solanaWallet.adapter;
      if (!provider.publicKey) {
        throw new Error("Wallet not connected");
      }

      const address = provider.publicKey.toBase58();
      const nonce = `Sign in to Holobots Dapp at ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(nonce);
      
      // Check if signMessage is available
      if (!('signMessage' in provider)) {
        throw new Error("Wallet does not support message signing");
      }
      
      const signedMessage = await provider.signMessage!(encodedMessage);

      // Verify signature and create session
      const { data, error } = await supabase.functions.invoke('verify-wallet', {
        body: { address, nonce, signedMessage, type: 'solana' }
      });

      if (error) throw error;

      // Set the session in Supabase
      if (data?.session) {
        const { data: { session }, error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;
      }

      toast({
        title: "Success",
        description: "Successfully authenticated with Solana wallet",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Solana auth error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with Solana wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={signInWithEVM}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
        disabled={isLoading}
      >
        <Wallet className="w-5 h-5" />
        Connect EVM Wallet
      </Button>

      <Button
        onClick={signInWithSolana}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
        disabled={isLoading}
      >
        <Wallet className="w-5 h-5" />
        Connect Solana Wallet
      </Button>
    </div>
  );
};