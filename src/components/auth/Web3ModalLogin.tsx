import { useWeb3Modal } from '@web3modal/react';
import { useAccount, useSignMessage } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Wallet } from "lucide-react";
import { verifyWallet } from "@/lib/firebase";

export const Web3ModalLogin = ({ isLoading }: { isLoading: boolean }) => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleWeb3Login = async () => {
    try {
      if (!isConnected) {
        await open();
        return;
      }

      if (!address) {
        throw new Error("No wallet address found");
      }

      // Generate nonce
      const nonce = `Sign in to Holobots Dapp at ${new Date().toISOString()}`;
      const signature = await signMessageAsync({ 
        message: nonce,
        account: address
      });

      // Verify signature and create session using Firebase Cloud Function
      const result = await verifyWallet({ address, nonce, signature, type: 'evm' });

      if (result.data?.token) {
        // Sign in to Firebase with custom token
        const { signInWithCustomToken } = await import('@/lib/firebase');
        const { auth } = await import('@/lib/firebase');
        await signInWithCustomToken(auth, result.data.token);
      }

      toast({
        title: "Success",
        description: "Successfully authenticated with Web3",
      });
      
      navigate("/");
    } catch (error) {
      console.error("Web3 auth error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to authenticate with Web3",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleWeb3Login}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
      disabled={isLoading}
    >
      <Wallet className="w-5 h-5" />
      {isConnected ? "Sign Message to Login" : "Connect Web3 Wallet"}
    </Button>
  );
};