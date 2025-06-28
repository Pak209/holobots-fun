import { ethers } from "ethers";
import BoosterStakerABI from "@/abis/BoosterStaker.json";
import { CONTRACT_ADDRESSES } from "@/lib/constants";

export function getBoosterStakerContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.boosterStaker, BoosterStakerABI, provider);
}

export type BoosterStakerContract = ReturnType<typeof getBoosterStakerContract>;

// Common contract interactions
export async function stakeBoosterPack(
  contract: BoosterStakerContract,
  tokenId: number
) {
  const tx = await contract.stake(tokenId);
  return tx.wait();
}

export async function unstakeBoosterPack(
  contract: BoosterStakerContract,
  tokenId: number
) {
  const tx = await contract.unstake(tokenId);
  return tx.wait();
}

export async function getStakedBoosterPacks(
  contract: BoosterStakerContract,
  user: string
) {
  return await contract.getStakedTokens(user);
}

export async function getStakeRewards(
  contract: BoosterStakerContract,
  user: string
) {
  return await contract.getRewards(user);
}

export async function claimStakeRewards(
  contract: BoosterStakerContract
) {
  const tx = await contract.claimRewards();
  return tx.wait();
}

export async function getStakeInfo(
  contract: BoosterStakerContract,
  tokenId: number
) {
  return await contract.getStakeInfo(tokenId);
} 