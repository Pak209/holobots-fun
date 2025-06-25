import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MARKETPLACE_BOOSTER_TIERS, PURCHASABLE_BOOSTER_TIERS, MarketplaceBoosterTier } from '../../types/boosterPack';
import { Coins, Package, Zap, Star } from 'lucide-react';

interface MarketplaceBoosterCardProps {
  onPurchase: (tier: MarketplaceBoosterTier) => void;
  disabled?: boolean;
  userHolos?: number;
}

const MarketplaceBoosterCard: React.FC<MarketplaceBoosterCardProps> = ({
  onPurchase,
  disabled = false,
  userHolos = 0
}) => {
  const [selectedTier, setSelectedTier] = useState<MarketplaceBoosterTier>('common');
  
  const selectedBooster = MARKETPLACE_BOOSTER_TIERS[selectedTier];
  const canAfford = userHolos >= selectedBooster.price;

  const getTierColor = (tier: MarketplaceBoosterTier) => {
    switch (tier) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'champion': return 'text-blue-400 border-blue-400';
      case 'rare': return 'text-purple-400 border-purple-400';
      case 'elite': return 'text-yellow-400 border-yellow-400';
      case 'legendary': return 'text-pink-400 border-pink-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTierGradient = (tier: MarketplaceBoosterTier) => {
    switch (tier) {
      case 'common': return 'from-gray-600 to-gray-700';
      case 'champion': return 'from-blue-600 to-blue-700';
      case 'rare': return 'from-purple-600 to-purple-700';
      case 'elite': return 'from-yellow-600 to-orange-600';
      case 'legendary': return 'from-pink-600 to-purple-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <Card className={`relative overflow-hidden border-2 ${getTierColor(selectedTier)} shadow-xl hover:shadow-2xl transition-all duration-300`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTierGradient(selectedTier)} opacity-20`}></div>
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-center text-xl font-black text-white flex items-center justify-center space-x-2">
          <Package className="w-6 h-6" />
          <span>RANK BOOSTERS</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 p-6 space-y-4">
        {/* Tier Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-300">Select Rank:</label>
          <Select value={selectedTier} onValueChange={(value) => setSelectedTier(value as MarketplaceBoosterTier)}>
            <SelectTrigger className="w-full bg-black/30 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {PURCHASABLE_BOOSTER_TIERS.map((tier) => (
                <SelectItem 
                  key={tier} 
                  value={tier}
                  className="text-white hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`${getTierColor(tier)} text-xs`}>
                      {tier.toUpperCase()}
                    </Badge>
                    <span>{MARKETPLACE_BOOSTER_TIERS[tier].name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Booster Info */}
        <div className="bg-black/30 rounded-lg p-4 space-y-3">
          <div className="text-center">
            <Badge variant="outline" className={`${getTierColor(selectedTier)} text-lg px-3 py-1 font-bold`}>
              {selectedTier.toUpperCase()} RANK
            </Badge>
          </div>
          
          <p className="text-sm text-gray-300 text-center">
            {selectedBooster.description}
          </p>

          {/* Drop Rates */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Common:</span>
              <span className="font-bold">{Math.round(selectedBooster.rarity.common * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Rare:</span>
              <span className="font-bold">{Math.round(selectedBooster.rarity.rare * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Epic:</span>
              <span className="font-bold">{Math.round(selectedBooster.rarity.epic * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">Legendary:</span>
              <span className="font-bold">{Math.round(selectedBooster.rarity.legendary * 100)}%</span>
            </div>
          </div>

          {/* Guaranteed Items */}
          <div className="text-center">
            <span className="text-green-400 font-bold text-sm">
              {selectedBooster.guaranteed} GUARANTEED ITEMS
            </span>
          </div>
        </div>

        {/* Price and Purchase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Price:</span>
            </div>
            <span className="text-yellow-400 font-bold text-lg">
              {selectedBooster.price} HOLOS
            </span>
          </div>

          <Button
            onClick={() => onPurchase(selectedTier)}
            disabled={disabled || !canAfford}
            className={`w-full font-bold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              canAfford 
                ? `bg-gradient-to-r ${getTierGradient(selectedTier)} hover:opacity-90 text-white` 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            <Zap className="w-5 h-5 mr-2" />
            {canAfford ? 'PURCHASE BOOSTER' : `NEED ${selectedBooster.price - userHolos} MORE HOLOS`}
          </Button>
        </div>

        {/* Special Note for Elite+ */}
        {(selectedTier === 'elite') && (
          <div className="bg-yellow-900/30 border border-yellow-400/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold text-sm">ELITE TIER</span>
            </div>
            <p className="text-xs text-yellow-300">
              High chance for Epic and Legendary items! Perfect for competitive players.
            </p>
          </div>
        )}
      </CardContent>

      {/* Tier-specific glow effect */}
      {selectedTier === 'elite' && (
        <div className="absolute inset-0 rounded-lg animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10 rounded-lg blur-xl"></div>
        </div>
      )}
    </Card>
  );
};

export default MarketplaceBoosterCard; 