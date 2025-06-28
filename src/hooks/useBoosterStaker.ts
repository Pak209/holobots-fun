import { useWalletClient, usePublicClient, useAccount } from "wagmi";
import { useMemo } from "react";
import { getBoosterStakerContract } from "@/lib/contracts/boosterStaker";
import { ethers } from "ethers";

export function useBoosterStaker() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const readOnlyContract = useMemo(() => {
    if (!publicClient) return null;
    
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => publicClient.request({ method: method as any, params } as any)
    } as any);
    
    return getBoosterStakerContract(provider);
  }, [publicClient]);

  const writeContract = useMemo(() => {
    if (!walletClient || !isConnected) return null;
    
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => walletClient.request({ method: method as any, params } as any)
    } as any);
    
    return getBoosterStakerContract(provider);
  }, [walletClient, isConnected]);

  return {
    contract: writeContract || readOnlyContract,
    readOnlyContract,
    writeContract,
    isConnected,
  };
}

export function useBoosterStaking() {
  const { writeContract } = useBoosterStaker();

  const stake = async (tokenId: number) => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.stake(tokenId);
      return await tx.wait();
    } catch (error) {
      console.error('Error staking booster pack:', error);
      throw error;
    }
  };

  const unstake = async (tokenId: number) => {
    if (!writeContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await writeContract.unstake(tokenId);
      return await tx.wait();
    } catch (error) {
      console.error('Error unstaking booster pack:', error);
      throw error;
    }
  };

  return { stake, unstake };
}

export function useStakedBoosterPacks() {
  const { contract } = useBoosterStaker();
  const { address } = useAccount();

  const getStakedTokens = async () => {
    if (!contract || !address) return [];
    try {
      const tokens = await contract.getStakedTokens(address);
      return tokens.map((token: bigint) => Number(token));
    } catch (error) {
      console.error('Error fetching staked booster packs:', error);
      return [];
    }
  };

  return { getStakedTokens };
}

export function useBoosterStakeRewards() {
  const { contract, writeContract } = useBoosterStaker();
  const { address } = useAccount();

  const getRewards = async () => {
    if (!contract || !address) return BigInt(0);
    try {
      return await contract.getRewards(address);
    } catch (error) {
      console.error('Error fetching booster stake rewards:', error);
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
      console.error('Error claiming booster stake rewards:', error);
      throw error;
    }
  };

  return { getRewards, claimRewards };
} 