/**
 * Hook for converting existing blueprint pieces to seasonal rentals
 * Reads from current Supabase blueprint storage and creates rental Holobots
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { getTierFromBlueprintCount, calculateRentalExpiry } from '@/integrations/holos/pricing';
import { type TierType, type SeasonalRental } from '@/integrations/holos';

export const useBlueprintToRental = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  /**
   * Check if user has enough blueprints for a specific tier
   */
  const canCreateRental = useCallback((holobotKey: string, targetTier?: TierType) => {
    if (!user?.blueprints) return false;
    
    const blueprintCount = user.blueprints[holobotKey] || 0;
    const tierRequirements = {
      'COMMON': 5,
      'CHAMPION': 10, 
      'RARE': 20,
      'ELITE': 40,
      'LEGENDARY': 80
    };
    
    if (targetTier) {
      return blueprintCount >= tierRequirements[targetTier];
    }
    
    // Check if they can create any tier
    return blueprintCount >= tierRequirements['COMMON'];
  }, [user]);

  /**
   * Get available tiers for a holobot based on blueprint count
   */
  const getAvailableTiers = useCallback((holobotKey: string) => {
    if (!user?.blueprints) return [];
    
    const blueprintCount = user.blueprints[holobotKey] || 0;
    const tiers: { tier: TierType; required: number; available: boolean }[] = [
      { tier: 'COMMON', required: 5, available: blueprintCount >= 5 },
      { tier: 'CHAMPION', required: 10, available: blueprintCount >= 10 },
      { tier: 'RARE', required: 20, available: blueprintCount >= 20 },
      { tier: 'ELITE', required: 40, available: blueprintCount >= 40 },
      { tier: 'LEGENDARY', required: 80, available: blueprintCount >= 80 }
    ];
    
    return tiers.filter(t => t.available);
  }, [user]);

  /**
   * Convert blueprint pieces to a seasonal rental Holobot
   */
  const createRentalFromBlueprints = useCallback(async (
    holobotKey: string, 
    tier: TierType
  ): Promise<boolean> => {
    if (!user || !canCreateRental(holobotKey, tier)) {
      toast({
        title: "Insufficient Blueprints",
        description: `You don't have enough blueprint pieces to create a ${tier} ${holobotKey}.`,
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsCreating(true);

      const tierRequirements = {
        'COMMON': { required: 5, level: 1 },
        'CHAMPION': { required: 10, level: 11 },
        'RARE': { required: 20, level: 21 },
        'ELITE': { required: 40, level: 31 },
        'LEGENDARY': { required: 80, level: 41 }
      };

      const tierInfo = tierRequirements[tier];
      const currentBlueprints = user.blueprints![holobotKey] || 0;
      
      // Create rental Holobot
      const now = new Date().toISOString();
      const expiresAt = calculateRentalExpiry(now);
      
      const newRental: SeasonalRental = {
        id: `rental_${holobotKey}_${Date.now()}`,
        holobotKey,
        name: holobotKey.charAt(0).toUpperCase() + holobotKey.slice(1), // Capitalize name
        tier,
        level: tierInfo.level,
        experience: 0,
        seasonId: 'season1', // Current season
        createdAt: now,
        expiresAt,
        isExpired: false,
        canConvert: true,
        conversionPricing: {
          basePriceUSD: 0, // Will be calculated when needed
          playerRankDiscount: 0,
          stockpileDiscount: 0,
          questBonus: 0,
          holosDiscount: 0,
          finalPriceUSD: 0,
          paymentAmounts: { usdc: '0', eth: '0', holos: '0' }
        }
      };

      // Update user's blueprint count (subtract used pieces)
      const updatedBlueprints = {
        ...user.blueprints,
        [holobotKey]: currentBlueprints - tierInfo.required
      };

      // Add rental to user's rental collection
      const currentRentals = user.rental_holobots || [];
      const updatedRentals = [...currentRentals, newRental];

      // Update user profile in Supabase
      await updateUser({
        blueprints: updatedBlueprints,
        rental_holobots: updatedRentals
      });

      toast({
        title: `🎉 ${tier} ${holobotKey} Rental Created!`,
        description: `You now have a 90-day rental! Convert to NFT before it expires.`,
      });

      return true;

    } catch (error: any) {
      console.error('Error creating rental:', error);
      toast({
        title: "Rental Creation Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [user, updateUser, toast, canCreateRental]);

  /**
   * Get all rentals for a specific holobot type
   */
  const getRentalsForHolobot = useCallback((holobotKey: string) => {
    if (!user?.rental_holobots) return [];
    
    return user.rental_holobots.filter(rental => 
      rental.holobotKey === holobotKey && !rental.isExpired
    );
  }, [user]);

  /**
   * Get all active rentals for the user
   */
  const getAllActiveRentals = useCallback(() => {
    if (!user?.rental_holobots) return [];
    
    return user.rental_holobots.filter(rental => !rental.isExpired);
  }, [user]);

  return {
    isCreating,
    canCreateRental,
    getAvailableTiers,
    createRentalFromBlueprints,
    getRentalsForHolobot,
    getAllActiveRentals
  };
};
