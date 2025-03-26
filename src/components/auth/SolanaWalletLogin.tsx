
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";

interface SolanaWalletLoginProps {
  isLoading: boolean;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const SolanaWalletLogin = ({ 
  isLoading,
  onStart,
  onSuccess,
  onError
}: SolanaWalletLoginProps) => {
  const { connect: connectSolana, wallet: solanaWallet } = useWallet();
  const { toast } = useToast();
  const navigate = useNavigate();

  const signInWithSolana = async () => {
    try {
      onStart?.();

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
      
      // Safely try to sign message
      let signedMessage;
      try {
        signedMessage = await provider.signMessage!(encodedMessage);
      } catch (signError) {
        console.error("Signature error:", signError);
        onError?.(signError);
        return;
      }

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
      
      onSuccess?.();
      navigate("/dashboard");
    } catch (error) {
      console.error("Solana auth error:", error);
      onError?.(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with Solana wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={signInWithSolana}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
      disabled={isLoading}
    >
      <Wallet className="w-5 h-5" />
      Connect Solana Wallet
    </Button>
  );
};
