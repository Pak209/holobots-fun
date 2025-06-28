import { ethers } from "ethers";
import TreasuryABI from "@/abis/Treasury.json";
import { CONTRACT_ADDRESSES } from "@/lib/constants";

export function getTreasuryContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.treasury, TreasuryABI, provider);
}

export type TreasuryContract = ReturnType<typeof getTreasuryContract>;

// Common contract interactions
export async function getTreasuryBalance(
  contract: TreasuryContract
) {
  return await contract.getTreasuryBalance();
}

export async function withdrawFromTreasury(
  contract: TreasuryContract,
  amount: bigint,
  to: string
) {
  const tx = await contract.withdraw(amount, to);
  return tx.wait();
}

export async function depositToTreasury(
  contract: TreasuryContract,
  amount: bigint
) {
  const tx = await contract.deposit({ value: amount });
  return tx.wait();
}

export async function getTreasuryOwner(
  contract: TreasuryContract
) {
  return await contract.owner();
}

export async function transferTreasuryOwnership(
  contract: TreasuryContract,
  newOwner: string
) {
  const tx = await contract.transferOwnership(newOwner);
  return tx.wait();
} 