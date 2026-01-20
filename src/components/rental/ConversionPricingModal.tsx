/**
 * Modal for displaying rental-to-NFT conversion pricing and payment options
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  CreditCard, 
  Zap, 
  Clock, 
  TrendingDown, 
  Star,
  Trophy,
  Target
} from 'lucide-react';
import { useRentalConversion } from '@/hooks/useRentalConversion';
import { type TierType, type PaymentMethod } from '@/integrations/holos';

interface ConversionPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: {
    id: string;
    holobotKey: string;
    name: string;
    tier: TierType;
    expiresAt: string;
  };
  stockpileStakeAmount?: number;
}

export const ConversionPricingModal = ({
  isOpen,
  onClose,
  rental,
  stockpileStakeAmount = 0
}: ConversionPricingModalProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('holos');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    calculatePricing, 
    convertRentalToNFT, 
    canAffordConversion,
    isConverting 
  } = useRentalConversion();

  const pricing = calculatePricing(rental.tier, selectedPaymentMethod, stockpileStakeAmount);
  const canAfford = canAffordConversion(rental.tier, selectedPaymentMethod, stockpileStakeAmount);

  if (!pricing) return null;

  // Calculate time remaining
  const timeRemaining = new Date(rental.expiresAt).getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));
  const isExpiring = daysRemaining <= 7;

  const handleConvert = async () => {
    setIsProcessing(true);
    const success = await convertRentalToNFT({
      rentalId: rental.id,
      holobotKey: rental.holobotKey,
      tier: rental.tier,
      paymentMethod: selectedPaymentMethod,
      stockpileStakeAmount
    });
    
    if (success) {
      onClose();
    }
    setIsProcessing(false);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'usdc': return <CreditCard className="h-4 w-4" />;
      case 'eth': return <Zap className="h-4 w-4" />;
      case 'holos': return <Coins className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'usdc': return 'USDC';
      case 'eth': return 'ETH';
      case 'holos': return 'HOLOS (20% Discount)';
    }
  };

  const getTierColor = (tier: TierType) => {
    switch (tier) {
      case 'COMMON': return 'bg-gray-100 text-gray-800';
      case 'CHAMPION': return 'bg-green-100 text-green-800';
      case 'RARE': return 'bg-blue-100 text-blue-800';
      case 'ELITE': return 'bg-purple-100 text-purple-800';
      case 'LEGENDARY': return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Convert to Permanent NFT
          </DialogTitle>
        </DialogHeader>

        {/* Rental Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              {rental.name}
              <Badge className={getTierColor(rental.tier)}>
                {rental.tier}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {isExpiring ? (
                <span className="text-red-600 font-medium">
                  Expires in {daysRemaining} days!
                </span>
              ) : (
                <span>Expires in {daysRemaining} days</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Base Price */}
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>${pricing.basePriceUSD.toFixed(2)}</span>
            </div>

            {/* Discounts */}
            {pricing.playerRankDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Player Rank (-{pricing.playerRankDiscount}%)
                </span>
                <span>-${(pricing.basePriceUSD * pricing.playerRankDiscount / 100).toFixed(2)}</span>
              </div>
            )}

            {pricing.stockpileDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Stockpile Stake (-{pricing.stockpileDiscount}%)
                </span>
                <span>-${(pricing.basePriceUSD * pricing.stockpileDiscount / 100).toFixed(2)}</span>
              </div>
            )}

            {pricing.questBonus > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Quest Bonus
                </span>
                <span>-${pricing.questBonus.toFixed(2)}</span>
              </div>
            )}

            {pricing.holosDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  HOLOS Payment (-{pricing.holosDiscount}%)
                </span>
                <span>-${(pricing.basePriceUSD * pricing.holosDiscount / 100).toFixed(2)}</span>
              </div>
            )}

            <Separator />

            {/* Final Price */}
            <div className="flex justify-between text-lg font-bold">
              <span>Final Price</span>
              <span>${pricing.finalPriceUSD.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h3 className="font-medium">Payment Method</h3>
          <div className="grid grid-cols-1 gap-2">
            {(['usdc', 'eth', 'holos'] as PaymentMethod[]).map((method) => (
              <Button
                key={method}
                variant={selectedPaymentMethod === method ? 'default' : 'outline'}
                className="justify-between p-4 h-auto"
                onClick={() => setSelectedPaymentMethod(method)}
              >
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(method)}
                  <span>{getPaymentMethodLabel(method)}</span>
                </div>
                {method === 'holos' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    20% OFF
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleConvert}
            disabled={!canAfford || isConverting || isProcessing}
            className="flex-1"
          >
            {isConverting || isProcessing ? (
              <>Converting...</>
            ) : (
              <>Convert to NFT</>
            )}
          </Button>
        </div>

        {!canAfford && (
          <p className="text-sm text-red-600 text-center">
            Insufficient {selectedPaymentMethod.toUpperCase()} balance
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
