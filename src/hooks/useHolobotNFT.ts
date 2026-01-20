import { useWalletClient, usePublicClient, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
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
  const publicClient = usePublicClient();

  const mint = async (tokenId: number) => {
    console.log('🚀 Mint function called with tokenId:', tokenId);
    console.log('📍 Address:', address);
    console.log('🌐 Chain:', chain);
    console.log('🔗 Chain ID:', chain?.id);
    
    if (!address || !chain) {
      console.error('❌ Wallet not connected or wrong network');
      throw new Error('Wallet not connected or wrong network');
    }
    
    // HARDCODED CHECK: Ensure we're on Base Sepolia (84532)
    if (chain.id !== 84532) {
      console.error('❌ Wrong network! Expected Base Sepolia (84532), got:', chain.id);
      throw new Error(`Wrong network! Please switch to Base Sepolia. Current chain ID: ${chain.id}`);
    }
    
    if (!publicClient) {
      console.error('❌ Public client not available');
      throw new Error('Public client not available');
    }
    
    console.log('✅ Chain ID verified: Base Sepolia (84532)');
    
    // Log RPC endpoint being used
    try {
      const rpcUrl = (publicClient.transport as any).url || 'Unknown RPC';
      console.log('🌐 Using RPC endpoint:', rpcUrl);
      
      // Double-check chain ID from the RPC itself
      const actualChainId = await publicClient.getChainId();
      console.log('✅ RPC confirms Chain ID:', actualChainId);
      if (actualChainId !== 84532) {
        throw new Error(`RPC returned wrong chain ID! Expected 84532, got ${actualChainId}`);
      }
    } catch (rpcError) {
      console.warn('⚠️ Could not verify RPC endpoint:', rpcError);
    }
    
    // Check if we have enough ETH for gas
    try {
      const balance = await publicClient.getBalance({ address });
      console.log('💰 Wallet balance:', ethers.formatEther(balance), 'ETH');
      
      if (balance === 0n) {
        throw new Error('Insufficient funds: You need Base Sepolia ETH for gas fees. Get testnet ETH from a faucet.');
      }
    } catch (balanceError) {
      console.warn('⚠️ Could not check balance:', balanceError);
    }
    
    console.log('✅ Pre-checks passed, starting mint...');
    
    // Check wallet balance for RPC errors
    try {
      const balance = await publicClient.getBalance({ address });
      console.log('💰 Wallet balance check:', ethers.formatEther(balance), 'ETH');
      if (balance < 1000000000000000n) { // Less than 0.001 ETH
        throw new Error('Balance too low. You need at least 0.001 ETH for gas. Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia');
      }
    } catch (balanceError: any) {
      console.error('❌ Balance check failed:', balanceError);
      throw new Error(`Cannot check wallet balance: ${balanceError.message}. RPC may be down.`);
    }
    
    try {
      // Use ONLY publicMint() - the simplest function
      let hash;
      console.log('🎯 Calling publicMint() on contract:', CONTRACT_ADDRESSES.holobotNFT);

      // Build transaction params - SIMPLE publicMint() call only
           const txParams: any = {
             address: CONTRACT_ADDRESSES.holobotNFT as `0x${string}`,
             abi: HolobotABI,
        functionName: 'publicMint',
        args: [],
             chain,
             account: address,
           };
           
      console.log('📋 Transaction params:', {
        contract: txParams.address,
        function: txParams.functionName,
        chainId: chain.id,
        from: address,
      });
      
      // Try to estimate gas first to catch errors early
      console.log('⛽ Estimating gas...');
      try {
        const gasEstimate = await publicClient.estimateContractGas({
          address: txParams.address,
          abi: txParams.abi,
          functionName: txParams.functionName,
          args: txParams.args,
          account: address,
        });
        console.log('✅ Gas estimate:', gasEstimate.toString());
      } catch (gasError: any) {
        console.error('❌ Gas estimation failed:', gasError);
        const gasErrorMsg = gasError?.message || gasError?.shortMessage || '';
        
        // Parse the error
        if (gasErrorMsg.includes('Max supply reached')) {
          throw new Error('Max supply of 10,000 NFTs has been reached. No more can be minted.');
        }
        if (gasErrorMsg.includes('Max mints per wallet reached')) {
          throw new Error('You have already minted the maximum of 5 NFTs per wallet.');
        }
        if (gasErrorMsg.includes('Internal JSON-RPC error')) {
          throw new Error('RPC error: The network is having issues. Please try again in a few seconds, or switch to a different RPC endpoint.');
        }
        
        throw new Error(`Cannot estimate gas: ${gasErrorMsg}. The transaction would likely fail.`);
      }
      
      // Send transaction
      console.log('📤 Sending transaction...');
      try {
           hash = await writeContractAsync(txParams);
        console.log(`✅ Transaction submitted successfully!`);
        console.log(`📝 Transaction hash: ${hash}`);
        console.log(`🔍 View on BaseScan: https://sepolia.basescan.org/tx/${hash}`);
        
        // Immediately verify transaction exists
        console.log('⏳ Verifying transaction was accepted by the network...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for RPC to process
        
        const txCheck = await publicClient.getTransaction({ hash: hash as `0x${string}` });
        if (!txCheck) {
          console.warn('⚠️ Transaction hash returned but not yet visible on network. Will retry verification...');
        } else {
          console.log('✅ Transaction confirmed in network mempool:', txCheck.hash);
        }
      } catch (sendError: any) {
        console.error(`❌ Failed to send transaction:`, sendError);
        const sendErrorMsg = sendError?.message || sendError?.shortMessage || 'Unknown error';
        
        // Parse send errors
        if (sendError.code === 4001 || sendErrorMsg.includes('User rejected')) {
          throw new Error('You cancelled the transaction in your wallet.');
        }
        if (sendErrorMsg.includes('insufficient funds')) {
          throw new Error('Insufficient ETH for gas fees. Get testnet ETH from: https://www.alchemy.com/faucets/base-sepolia');
        }
        if (sendErrorMsg.includes('Internal JSON-RPC error')) {
          throw new Error('RPC connection error. The network may be congested. Please wait 10 seconds and try again.');
        }
        
        throw new Error(`Transaction failed: ${sendErrorMsg}`);
      }

      if (!hash) {
        throw new Error('Transaction was not submitted. Please try again.');
      }
      
      console.log('⏳ Waiting for transaction confirmation on blockchain...');
      console.log(`🔍 Check status at: https://sepolia.basescan.org/tx/${hash}`);
      
      // Return transaction object with proper wait function that checks blockchain
      return { 
        hash, 
        wait: async () => {
          try {
            console.log('⏳ Waiting for transaction to be mined (timeout: 60 seconds)...');
            
            // First, verify the transaction exists by trying to get it
            // Give it more time and retries since RPC can be slow
            let txExists = false;
            for (let i = 0; i < 10; i++) {
              try {
                const tx = await publicClient.getTransaction({ hash: hash as `0x${string}` });
                if (tx) {
                  console.log('✅ Transaction found in mempool/blockchain!');
                  console.log('   - Hash:', tx.hash);
                  console.log('   - From:', tx.from);
                  console.log('   - To:', tx.to);
                  console.log('   - Nonce:', tx.nonce);
                  txExists = true;
                  break;
                }
              } catch (txError) {
                console.log(`⏳ Attempt ${i + 1}/10: Transaction not yet visible, waiting 3 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
         }
       }

            if (!txExists) {
              console.error('❌ Transaction was submitted but never appeared after 30 seconds');
              console.error('📝 Transaction hash:', hash);
              console.error('🔍 Check manually: https://sepolia.basescan.org/tx/' + hash);
              throw new Error(`Transaction submitted but not indexed by RPC after 30 seconds. Check BaseScan: https://sepolia.basescan.org/tx/${hash}`);
            }
            
            // Wait for transaction receipt with timeout
            const receipt = await publicClient.waitForTransactionReceipt({ 
              hash: hash as `0x${string}`,
              confirmations: 1,
              timeout: 60_000, // 60 seconds
            });
            
            console.log('✅ Transaction confirmed on blockchain!', receipt);
            console.log(`🔍 View transaction: https://sepolia.basescan.org/tx/${receipt.transactionHash}`);
            
            if (receipt.status === 'reverted') {
              throw new Error('Transaction was mined but reverted. The contract may have rejected it.');
            }
            
            return {
              hash: receipt.transactionHash,
              blockNumber: receipt.blockNumber,
              status: receipt.status,
              receipt,
            };
          } catch (waitError: any) {
            console.error('❌ Error waiting for transaction:', waitError);
            console.error('🔍 Check transaction status at: https://sepolia.basescan.org/tx/' + hash);
            
            // FALLBACK: Try to get receipt directly one more time
            // This handles cases where transaction was sped up or replaced
            console.log('⚠️ Wait failed, trying direct receipt fetch as fallback...');
            try {
              const fallbackReceipt = await publicClient.getTransactionReceipt({ 
                hash: hash as `0x${string}` 
              });
              
              if (fallbackReceipt) {
                console.log('✅ Fallback successful! Transaction was mined:', fallbackReceipt);
                
                if (fallbackReceipt.status === 'success') {
                  return {
                    hash: fallbackReceipt.transactionHash,
                    blockNumber: fallbackReceipt.blockNumber,
                    status: fallbackReceipt.status,
                    receipt: fallbackReceipt,
                  };
                }
              }
            } catch (fallbackError) {
              console.warn('⚠️ Fallback receipt fetch also failed');
            }
            
            // If fallback also failed, throw a softer error with instructions
            if (waitError.message?.includes('timeout')) {
              throw new Error(`Transaction may be pending. Check BaseScan to verify: https://sepolia.basescan.org/tx/${hash}`);
            }
            
            throw new Error(`Could not confirm transaction. Please check BaseScan: https://sepolia.basescan.org/tx/${hash}`);
          }
        }
      };
     } catch (error) {
       console.error('💥 Critical error in mint function:', error);
       console.error('Error details:', error.message, error.stack);
       throw error;
     }
  };

  return { mint };
} 