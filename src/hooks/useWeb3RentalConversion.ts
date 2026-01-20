/**
 * Web3 Hook for Rental Conversion with Deployed Contracts
 * Connects to deployed RentalConversionManager to mint actual NFTs
 */

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEther, parseUnits, encodePacked } from 'viem';
import { useToast } from '@/components/ui/use-toast';
import { HOLOS_CONTRACTS } from '@/integrations/holos';
import RentalConversionManagerABI from '@/abis/RentalConversionManager.json';
import ERC20ABI from '@/abis/ERC20.json';

interface ConversionParams {
  rentalId: string;
  tier: string; // 'Common', 'Champion', 'Rare', 'Elite', 'Legendary'
  paymentMethod: 'eth' | 'usdc' | 'holos';
  holobotData: string; // Encoded holobot metadata
}

export const useWeb3RentalConversion = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionHash, setConversionHash] = useState<string | null>(null);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvalStep, setApprovalStep] = useState<'none' | 'approving' | 'approved'>('none');
  
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Map tier names to numbers for contract
  const getTierNumber = (tier: string): number => {
    switch (tier.toLowerCase()) {
      case 'common': return 0;
      case 'champion': return 1;
      case 'rare': return 2;
      case 'elite': return 3;
      case 'legendary': return 4;
      default: return 0;
    }
  };

  // Get pricing for display
  const getTierPricing = (tier: string) => {
    const pricing = {
      common: { usd: 5, eth: "0.002", holos: "500", holosDiscounted: "400" },
      champion: { usd: 15, eth: "0.006", holos: "1500", holosDiscounted: "1200" },
      rare: { usd: 35, eth: "0.014", holos: "3500", holosDiscounted: "2800" },
      elite: { usd: 75, eth: "0.03", holos: "7500", holosDiscounted: "6000" },
      legendary: { usd: 125, eth: "0.05", holos: "12500", holosDiscounted: "10000" }
    };
    return pricing[tier.toLowerCase() as keyof typeof pricing];
  };

  // Get token allowance for USDC/HOLOS
  const { data: usdcAllowance } = useReadContract({
    address: HOLOS_CONTRACTS.MOCK_USDC as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER] : undefined,
  });

  const { data: holosAllowance } = useReadContract({
    address: HOLOS_CONTRACTS.HOLOS_TOKEN as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: address ? [address, HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER] : undefined,
  });

  // Check if allowance is sufficient
  const checkTokenAllowance = (tokenAddress: string, amount: bigint) => {
    if (tokenAddress === HOLOS_CONTRACTS.MOCK_USDC) {
      return (usdcAllowance as bigint || 0n) >= amount;
    } else if (tokenAddress === HOLOS_CONTRACTS.HOLOS_TOKEN) {
      return (holosAllowance as bigint || 0n) >= amount;
    }
    return false;
  };

  // Approve token spending
  const approveToken = async (tokenAddress: string, amount: bigint) => {
    try {
      setApprovalStep('approving');
      
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER, amount],
      });
      
      toast({
        title: "Approval Required",
        description: "Please approve token spending in your wallet.",
      });
      
    } catch (error: any) {
      setApprovalStep('none');
      toast({
        title: "Approval Failed",
        description: error.message || "Token approval failed.",
        variant: "destructive"
      });
    }
  };

  const convertRentalToNFT = async (params: ConversionParams) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to convert rentals to NFTs.",
        variant: "destructive"
      });
      return false;
    }

    if (!HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER) {
      toast({
        title: "Contract Not Available",
        description: "Rental conversion contract not deployed yet.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsConverting(true);
      
      const tierNumber = getTierNumber(params.tier);
      const pricing = getTierPricing(params.tier);
      
      // Encode holobot metadata for the contract
      const holobotDataBytes = encodePacked(
        ['string', 'string', 'uint256'],
        [params.rentalId, params.tier, BigInt(Date.now())]
      );

      // Prepare transaction based on payment method
      if (params.paymentMethod === 'eth') {
        // ETH payment - direct transaction
        const ethAmount = parseEther(pricing.eth);
        
        writeContract({
          address: HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER as `0x${string}`,
          abi: RentalConversionManagerABI,
          functionName: 'convertWithEth',
          args: [tierNumber, holobotDataBytes],
          value: ethAmount,
        });
        
        toast({
          title: "ETH Payment Initiated",
          description: `Converting ${params.tier} rental for ${pricing.eth} ETH. Confirm in wallet.`,
        });
        
      } else if (params.paymentMethod === 'usdc') {
        // USDC payment - check approval first
        const usdcAmount = parseUnits(pricing.usd.toString(), 6); // 6 decimals for USDC
        
        const hasAllowance = checkTokenAllowance(HOLOS_CONTRACTS.MOCK_USDC, usdcAmount);
        
        if (!hasAllowance) {
          await approveToken(HOLOS_CONTRACTS.MOCK_USDC, usdcAmount);
          return true; // Will continue after approval
        }
        
        writeContract({
          address: HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER as `0x${string}`,
          abi: RentalConversionManagerABI,
          functionName: 'convertWithUsdc',
          args: [tierNumber, usdcAmount, holobotDataBytes],
        });
        
        toast({
          title: "USDC Payment Initiated",
          description: `Converting ${params.tier} rental for $${pricing.usd} USDC. Confirm in wallet.`,
        });
        
      } else if (params.paymentMethod === 'holos') {
        // HOLOS payment with 20% discount - check approval first
        const holosAmount = parseEther(pricing.holosDiscounted); // Use discounted amount
        
        const hasAllowance = checkTokenAllowance(HOLOS_CONTRACTS.HOLOS_TOKEN, holosAmount);
        
        if (!hasAllowance) {
          await approveToken(HOLOS_CONTRACTS.HOLOS_TOKEN, holosAmount);
          return true; // Will continue after approval
        }
        
        writeContract({
          address: HOLOS_CONTRACTS.RENTAL_CONVERSION_MANAGER as `0x${string}`,
          abi: RentalConversionManagerABI,
          functionName: 'convertWithHolos',
          args: [tierNumber, holosAmount, holobotDataBytes],
        });
        
        toast({
          title: "HOLOS Payment Initiated",
          description: `Converting ${params.tier} rental for ${pricing.holosDiscounted} HOLOS (20% discount!). Confirm in wallet.`,
        });
      }
      
      setConversionHash(hash || null);

      return true;

    } catch (error: any) {
      console.error('Conversion failed:', error);
      
      toast({
        title: "Conversion Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsConverting(false);
    }
  };

  // Handle transaction confirmation
  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: "🎉 NFT Minted Successfully!",
        description: `Your rental has been converted to a permanent NFT! Transaction: ${hash.slice(0, 10)}...`,
      });
      
      // TODO: Update rental status in database
      // markRentalAsConverted(rentalId, hash);
    }
    
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "The transaction was rejected or failed.",
        variant: "destructive"
      });
    }
  }, [isSuccess, error, hash, toast]);

  return {
    convertRentalToNFT,
    approveToken,
    isConverting: isConverting || isPending || isConfirming,
    conversionHash,
    isConfirming,
    isSuccess,
    getTierPricing,
    needsApproval,
    approvalStep
  };
};
