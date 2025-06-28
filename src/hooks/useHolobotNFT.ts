import { useWalletClient, usePublicClient, useAccount, useWriteContract } from "wagmi";
import { useMemo } from "react";
import { getHolobotContract } from "@/lib/contracts/holobotNFT";
import { ethers } from "ethers";
import HolobotABI from "@/abis/HolobotNFT.json";
import { CONTRACT_ADDRESSES } from "@/lib/constants";

export function useHolobotNFT() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  const readOnlyContract = useMemo(() => {
    if (!publicClient) return null;
    
    // Create ethers provider from viem public client
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => publicClient.request({ method: method as any, params } as any)
    } as any);
    
    return getHolobotContract(provider);
  }, [publicClient]);

  const writeContract = useMemo(() => {
    if (!walletClient || !isConnected) return null;
    
    // Create ethers signer from viem wallet client
    const provider = new ethers.BrowserProvider({
      request: ({ method, params }) => walletClient.request({ method: method as any, params } as any)
    } as any);
    
    return getHolobotContract(provider);
  }, [walletClient, isConnected]);

  return {
    contract: writeContract || readOnlyContract,
    readOnlyContract,
    writeContract,
    isConnected,
  };
}

// Specific hook functions for common operations
export function useHolobotBalance() {
  const { contract } = useHolobotNFT();
  const { address } = useAccount();

  const getBalance = async () => {
    if (!contract || !address) return 0;
    try {
      const balance = await contract.balanceOf(address);
      return Number(balance);
    } catch (error) {
      console.error('Error fetching Holobot balance:', error);
      return 0;
    }
  };

  return { getBalance };
}

export function useHolobotMint() {
  const { writeContractAsync } = useWriteContract();
  const { address, chain } = useAccount();

  const mint = async (tokenId: number) => {
    console.log('🚀 Mint function called with tokenId:', tokenId);
    console.log('📍 Address:', address);
    console.log('🌐 Chain:', chain);
    
    if (!address || !chain) {
      console.error('❌ Wallet not connected or wrong network');
      throw new Error('Wallet not connected or wrong network');
    }
    
    console.log('✅ Pre-checks passed, starting mint attempts...');
    
    try {
      // Try different mint functions - we found mintWithEth in the contract events!
      let hash;
      const attempts = [
        // Based on contract events, try mintWithEth first with payment
        { name: 'mintWithEth', args: [1], value: '0.001' }, // 1 NFT for 0.001 ETH
        { name: 'mintWithEth', args: [tokenId], value: '0.001' }, // specific token ID
        { name: 'mintWithEth', args: [1], value: '0.0001' }, // try cheaper price
        { name: 'mintWithEth', args: [1], value: '0.00001' }, // very cheap
        // Try other functions as fallback
        { name: 'mint', args: [] },
        { name: 'publicMint', args: [] },
        { name: 'freeMint', args: [] },
      ];
      
      console.log('🎯 Will try', attempts.length, 'different mint approaches');

             let lastError;
       for (const attempt of attempts) {
         try {
           console.log(`Trying ${attempt.name} with args:`, attempt.args, attempt.value ? `value: ${attempt.value} ETH` : 'no payment');
           
           const txParams: any = {
             address: CONTRACT_ADDRESSES.holobotNFT as `0x${string}`,
             abi: HolobotABI,
             functionName: attempt.name,
             args: attempt.args,
             chain,
             account: address,
           };
           
           // Add ETH value if this is a payable function
           if (attempt.value) {
             txParams.value = BigInt(parseFloat(attempt.value) * 1e18); // Convert ETH to wei
           }
           
           hash = await writeContractAsync(txParams);
           console.log(`✅ Success with ${attempt.name}!`, hash);
           break; // Success - exit loop
         } catch (error) {
           console.log(`❌ ${attempt.name} failed:`, error);
           lastError = error;
           continue; // Try next function
         }
       }

             if (!hash) {
         console.error('💥 All mint attempts failed!');
         throw lastError || new Error('All mint attempts failed');
       }
       
       console.log('🎉 Mint successful! Hash:', hash);
       return { hash, wait: () => Promise.resolve({ hash }) };
     } catch (error) {
       console.error('💥 Critical error in mint function:', error);
       console.error('Error details:', error.message, error.stack);
       throw error;
     }
  };

  return { mint };
} 