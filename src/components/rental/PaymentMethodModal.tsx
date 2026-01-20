/**
 * Payment Method Selection Modal for NFT Conversion
 * Shows ETH, USDC, and HOLOS options with pricing and discounts
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, DollarSign, Percent, Info, Coins } from 'lucide-react';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: 'eth' | 'usdc' | 'holos') => void;
  tier: string;
  isConverting: boolean;
}

export const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  tier, 
  isConverting 
}: PaymentMethodModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'eth' | 'usdc' | 'holos'>('eth');

  // Get pricing for the tier
  const getPricing = (tier: string) => {
    const pricing = {
      common: { usd: 5, eth: "0.002", usdc: "5.00", holos: "500" },
      champion: { usd: 15, eth: "0.006", usdc: "15.00", holos: "1500" },
      rare: { usd: 35, eth: "0.014", usdc: "35.00", holos: "3500" },
      elite: { usd: 75, eth: "0.03", usdc: "75.00", holos: "7500" },
      legendary: { usd: 125, eth: "0.05", usdc: "125.00", holos: "12500" }
    };
    return pricing[tier.toLowerCase() as keyof typeof pricing];
  };

  const pricing = getPricing(tier);
  const discountedHolosPrice = (parseFloat(pricing.holos) * 0.8).toFixed(0); // 20% discount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1F2C] border-[#374151] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#33C3F0] flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Convert {tier} to NFT
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="bg-blue-500/10 border-blue-400/30">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-300">
              Choose your payment method. Your rental will be converted to a permanent NFT in your wallet.
            </AlertDescription>
          </Alert>

          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod as any}>
            {/* ETH Payment */}
            <div className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:border-[#33C3F0]/50">
              <RadioGroupItem value="eth" id="eth" />
              <Label htmlFor="eth" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-xs font-bold">
                      Ξ
                    </div>
                    <span className="font-medium">Ethereum (ETH)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{pricing.eth} ETH</div>
                    <div className="text-xs text-gray-400">≈ ${pricing.usd}</div>
                  </div>
                </div>
              </Label>
            </div>

            {/* USDC Payment */}
            <div className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg hover:border-[#33C3F0]/50">
              <RadioGroupItem value="usdc" id="usdc" />
              <Label htmlFor="usdc" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                      $
                    </div>
                    <span className="font-medium">USD Coin (USDC)</span>
                    <Badge className="bg-green-600 text-white text-xs">Stable</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${pricing.usdc}</div>
                    <div className="text-xs text-gray-400">Exact USD price</div>
                  </div>
                </div>
              </Label>
            </div>

            {/* HOLOS Payment with Discount */}
            <div className="flex items-center space-x-3 p-3 border border-orange-500/50 rounded-lg hover:border-orange-400/70 bg-orange-500/5">
              <RadioGroupItem value="holos" id="holos" />
              <Label htmlFor="holos" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                      H
                    </div>
                    <span className="font-medium">HOLOS Token</span>
                    <Badge className="bg-orange-600 text-white text-xs flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      20% OFF
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-400">
                      {discountedHolosPrice} HOLOS
                    </div>
                    <div className="text-xs text-gray-400 line-through">
                      {pricing.holos} HOLOS
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Payment Method Benefits */}
          <div className="space-y-2 text-sm">
            {selectedMethod === 'eth' && (
              <Alert className="bg-purple-500/10 border-purple-400/30">
                <Coins className="h-4 w-4" />
                <AlertDescription className="text-purple-300">
                  <strong>ETH Payment:</strong> Direct blockchain payment. No approvals needed.
                </AlertDescription>
              </Alert>
            )}
            
            {selectedMethod === 'usdc' && (
              <Alert className="bg-blue-500/10 border-blue-400/30">
                <Coins className="h-4 w-4" />
                <AlertDescription className="text-blue-300">
                  <strong>USDC Payment:</strong> Stable USD pricing. Requires token approval first.
                </AlertDescription>
              </Alert>
            )}
            
            {selectedMethod === 'holos' && (
              <Alert className="bg-orange-500/10 border-orange-400/30">
                <Coins className="h-4 w-4" />
                <AlertDescription className="text-orange-300">
                  <strong>HOLOS Payment:</strong> 20% discount! Supports the ecosystem. Requires token approval first.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onConfirm(selectedMethod)}
              disabled={isConverting}
              className="flex-1 bg-[#33C3F0] hover:bg-[#2A9FD8] text-white"
            >
              {isConverting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  Continue to Wallet
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
