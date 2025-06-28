import { ethers } from "ethers";
import StockpileABI from "@/abis/Stockpile.json";
import { CONTRACT_ADDRESSES } from "@/lib/constants";

export function getStockpileContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.stockpile, StockpileABI, provider);
}

export type StockpileContract = ReturnType<typeof getStockpileContract>;

// Common contract interactions
export async function getStockpileBalance(
  contract: StockpileContract,
  user: string
) {
  return await contract.balanceOf(user);
}

export async function depositToStockpile(
  contract: StockpileContract,
  amount: bigint
) {
  const tx = await contract.deposit(amount);
  return tx.wait();
}

export async function withdrawFromStockpile(
  contract: StockpileContract,
  amount: bigint
) {
  const tx = await contract.withdraw(amount);
  return tx.wait();
}

export async function getStockpileRewards(
  contract: StockpileContract,
  user: string
) {
  return await contract.getRewards(user);
}

export async function claimStockpileRewards(
  contract: StockpileContract
) {
  const tx = await contract.claimRewards();
  return tx.wait();
} 