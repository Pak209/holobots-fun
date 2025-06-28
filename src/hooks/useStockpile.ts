import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { useMemo } from "react";
import { getStockpileContract } from "@/lib/contracts/stockpile";
import { ethers } from "ethers";

export function useStockpile() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const readOnlyContract = useMemo(() => {
    if (!publicClient) return null;
    
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => publicClient.request({ method: method as any, params } as any)
    } as any);
    
    return getStockpileContract(provider);
  }, [publicClient]);

  const writeContract = useMemo(() => {
    if (!walletClient || !isConnected) return null;
    
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => walletClient.request({ method: method as any, params } as any)
    } as any);
    
    return getStockpileContract(provider);
  }, [walletClient, isConnected]);

  return {
    contract: writeContract || readOnlyContract,
    readOnlyContract,
    writeContract,
    isConnected,
  };
}

export function useStockpileBalance() {
  const { contract } = useStockpile();
  const { address } = useAccount();

  const getBalance = async () => {
    if (!contract || !address) return BigInt(0);
    try {
      return await contract.balanceOf(address);
    } catch (error) {
      console.error('Error fetching stockpile balance:', error);
      return BigInt(0);
    }
  };

  return { getBalance };
}

export function useStockpileDeposit() {
  const { writeContract } = useStockpile();

  const deposit = async (amount: bigint) => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.deposit(amount);
      return await tx.wait();
    } catch (error) {
      console.error('Error depositing to stockpile:', error);
      throw error;
    }
  };

  return { deposit };
}

export function useStockpileWithdraw() {
  const { writeContract } = useStockpile();

  const withdraw = async (amount: bigint) => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.withdraw(amount);
      return await tx.wait();
    } catch (error) {
      console.error('Error withdrawing from stockpile:', error);
      throw error;
    }
  };

  return { withdraw };
}

export function useStockpileRewards() {
  const { contract, writeContract } = useStockpile();
  const { address } = useAccount();

  const getRewards = async () => {
    if (!contract || !address) return BigInt(0);
    try {
      return await contract.getRewards(address);
    } catch (error) {
      console.error('Error fetching stockpile rewards:', error);
      return BigInt(0);
    }
  };

  const claimRewards = async () => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.claimRewards();
      return await tx.wait();
    } catch (error) {
      console.error('Error claiming stockpile rewards:', error);
      throw error;
    }
  };

  return { getRewards, claimRewards };
} 