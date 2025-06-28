import { ethers } from "ethers";
import HolobotABI from "@/abis/HolobotNFT.json";
import { CONTRACT_ADDRESSES } from "@/lib/constants";

export function getHolobotContract(provider: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESSES.holobotNFT, HolobotABI, provider);
}

export type HolobotContract = ReturnType<typeof getHolobotContract>;

// Common contract interactions
export async function mintHolobot(
  contract: HolobotContract,
  to: string,
  tokenId: number
) {
  const tx = await contract.mint(to, tokenId);
  return tx.wait();
}

export async function getHolobotOwner(
  contract: HolobotContract,
  tokenId: number
) {
  return await contract.ownerOf(tokenId);
}

export async function getHolobotBalance(
  contract: HolobotContract,
  owner: string
) {
  return await contract.balanceOf(owner);
}

export async function getHolobotTokenURI(
  contract: HolobotContract,
  tokenId: number
) {
  return await contract.tokenURI(tokenId);
} 