import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { useMemo } from "react";
import { getTreasuryContract } from "@/lib/contracts/treasury";
import { ethers } from "ethers";

export function useTreasury() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const readOnlyContract = useMemo(() => {
    if (!publicClient) return null;
    
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => publicClient.request({ method: method as any, params } as any)
    } as any);
    
    return getTreasuryContract(provider);
  }, [publicClient]);

  const writeContract = useMemo(() => {
    if (!walletClient || !isConnected) return null;
    
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => walletClient.request({ method: method as any, params } as any)
    } as any);
    
    return getTreasuryContract(provider);
  }, [walletClient, isConnected]);

  return {
    contract: writeContract || readOnlyContract,
    readOnlyContract,
    writeContract,
    isConnected,
  };
}

export function useTreasuryBalance() {
  const { contract } = useTreasury();

  const getBalance = async () => {
    if (!contract) return BigInt(0);
    try {
      return await contract.getTreasuryBalance();
    } catch (error) {
      console.error('Error fetching treasury balance:', error);
      return BigInt(0);
    }
  };

  return { getBalance };
}

export function useTreasuryDeposit() {
  const { writeContract } = useTreasury();

  const deposit = async (amount: bigint) => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.deposit({ value: amount });
      return await tx.wait();
    } catch (error) {
      console.error('Error depositing to treasury:', error);
      throw error;
    }
  };

  return { deposit };
}

export function useTreasuryWithdraw() {
  const { writeContract } = useTreasury();

  const withdraw = async (amount: bigint, to: string) => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.withdraw(amount, to);
      return await tx.wait();
    } catch (error) {
      console.error('Error withdrawing from treasury:', error);
      throw error;
    }
  };

  return { withdraw };
} 