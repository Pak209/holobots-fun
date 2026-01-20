/**
 * Hook for managing rental-to-NFT conversions.
 * Combines pricing logic with Web3 transaction handling.
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { calculateConversionPricing, PlayerDiscountData } from '@/integrations/holos/pricing';
import { type TierType, type PaymentMethod, type ConversionPricing } from '@/integrations/holos';
import { useWeb3RentalConversion } from './useWeb3RentalConversion';
import { useToast } from '@/components/ui/use-toast';

export const useRentalConversion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    convertRentalToNFT: web3Convert, 
    isConverting: isWeb3Converting,
    getTierPricing
  } = useWeb3RentalConversion();

  const [isLocalConverting, setIsLocalConverting] = useState(false);

  /**
   * Calculate pricing for a specific rental and payment method
   */
  const calculatePricing = (
    tier: TierType, 
    paymentMethod: PaymentMethod, 
    stockpileStakeAmount: number = 0
  ): ConversionPricing | null => {
    if (!user) return null;
    
    return calculateConversionPricing(
      tier,
      user,
      stockpileStakeAmount,
      paymentMethod === 'holos'
    );
  };

  /**
   * Check if player can afford the conversion
   * (Simplified - in a real app would check wallet balances)
   */
  const canAffordConversion = (
    tier: TierType,
    paymentMethod: PaymentMethod,
    stockpileStakeAmount: number = 0
  ): boolean => {
    // For now return true, actual balance check happens in the wallet transaction
    return true;
  };

  /**
   * Execute the conversion transaction
   */
  const convertRentalToNFT = async (params: {
    rentalId: string;
    holobotKey: string;
    tier: TierType;
    paymentMethod: PaymentMethod;
    stockpileStakeAmount: number;
  }) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to convert rentals.",
        variant: "destructive"
      });
      return false;
    }

    setIsLocalConverting(true);
    try {
      // Prepare data for the Web3 hook
      // We encode some basic data for the contract
      const holobotData = JSON.stringify({
        key: params.holobotKey,
        owner: user.id,
        convertedAt: new Date().toISOString()
      });

      const result = await web3Convert({
        rentalId: params.rentalId,
        tier: params.tier,
        paymentMethod: params.paymentMethod,
        holobotData: holobotData
      });

      return result;
    } catch (error: any) {
      console.error("Conversion hook error:", error);
      toast({
        title: "Conversion Error",
        description: error.message || "Failed to initiate conversion.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLocalConverting(false);
    }
  };

  return {
    calculatePricing,
    canAffordConversion,
    convertRentalToNFT,
    isConverting: isLocalConverting || isWeb3Converting
  };
};
