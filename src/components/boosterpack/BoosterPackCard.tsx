import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BOOSTER_PACK_TYPES, BoosterPackType } from '../../types/boosterPack';
import { Coins, Ticket, Zap, Shield, Cpu, Gift } from 'lucide-react';

interface BoosterPackCardProps {
  packType: BoosterPackType;
  onPurchase: (packType: BoosterPackType, paymentMethod: 'holos' | 'tickets') => void;
  disabled?: boolean;
  userHolos?: number;
  userTickets?: number;
}

const BoosterPackCard: React.FC<BoosterPackCardProps> = ({
  packType,
  onPurchase,
  disabled = false,
  userHolos = 0,
  userTickets = 0
}) => {
  const packConfig = BOOSTER_PACK_TYPES[packType];
  
  const getPackDesign = (type: BoosterPackType) => {
    switch (type) {
      case 'standard':
        return {
          bgGradient: 'from-blue-600 via-blue-700 to-blue-800',
          borderColor: 'border-blue-400',
          glowColor: 'shadow-blue-500/50',
          accentColor: 'text-blue-200'
        };
      case 'premium':
        return {
          bgGradient: 'from-purple-600 via-purple-700 to-purple-800',
          borderColor: 'border-purple-400',
          glowColor: 'shadow-purple-500/50',
          accentColor: 'text-purple-200'
        };
      case 'legendary':
        return {
          bgGradient: 'from-yellow-600 via-orange-600 to-red-600',
          borderColor: 'border-yellow-400',
          glowColor: 'shadow-yellow-500/50',
          accentColor: 'text-yellow-200'
        };
      default:
        return {
          bgGradient: 'from-gray-600 via-gray-700 to-gray-800',
          borderColor: 'border-gray-400',
          glowColor: 'shadow-gray-500/50',
          accentColor: 'text-gray-200'
        };
    }
  };

  const design = getPackDesign(packType);
  
  const canAffordHolos = packConfig.cost.holosTokens ? userHolos >= packConfig.cost.holosTokens : false;
  const canAffordTickets = packConfig.cost.gachaTickets ? userTickets >= packConfig.cost.gachaTickets : false;

  return (
    <Card className={`relative overflow-hidden ${design.borderColor} border-2 ${design.glowColor} shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
      {/* Jagged background pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${design.bgGradient}`}>
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon 
              points="0,0 20,10 40,5 60,15 80,8 100,12 100,100 0,100" 
              fill="url(#jagged-pattern)"
              className="fill-white/10"
            />
            <defs>
              <pattern id="jagged-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                <polygon points="0,0 10,5 20,0 20,20 0,20" className="fill-white/5" />
              </pattern>
            </defs>
          </svg>
        </div>
      </div>

      <CardContent className="relative z-10 p-6 text-white">
        {/* Pack Title */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-black tracking-wider uppercase mb-2 text-shadow-lg">
            {packConfig.name}
          </h3>
          <p className={`text-sm ${design.accentColor} font-semibold`}>
            {packConfig.description}
          </p>
        </div>

        {/* Content Icons */}
        <div className="flex justify-center space-x-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold">PARTS</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold">BLUEPRINTS</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 backdrop-blur-sm">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold">ITEMS</span>
          </div>
        </div>

        {/* Guaranteed Items Badge */}
        <div className="text-center mb-4">
          <Badge variant="secondary" className="bg-white/20 text-white font-bold text-lg px-4 py-2 backdrop-blur-sm">
            {packConfig.guaranteed} GUARANTEED ITEMS
          </Badge>
        </div>

        {/* Drop Rates */}
        <div className="mb-6 bg-black/30 rounded-lg p-3 backdrop-blur-sm">
          <h4 className="text-sm font-bold mb-2 text-center">DROP RATES</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Common:</span>
              <span className="font-bold">{Math.round(packConfig.rarity.common * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-300">Rare:</span>
              <span className="font-bold">{Math.round(packConfig.rarity.rare * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Epic:</span>
              <span className="font-bold">{Math.round(packConfig.rarity.epic * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-300">Legendary:</span>
              <span className="font-bold">{Math.round(packConfig.rarity.legendary * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Purchase Buttons */}
        <div className="space-y-3">
          {packConfig.cost.holosTokens && (
            <Button
              onClick={() => onPurchase(packType, 'holos')}
              disabled={disabled || !canAffordHolos}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Coins className="w-5 h-5 mr-2" />
              {packConfig.cost.holosTokens} HOLOS
              {!canAffordHolos && (
                <span className="ml-2 text-red-600 text-sm">
                  (Need {packConfig.cost.holosTokens - userHolos} more)
                </span>
              )}
            </Button>
          )}
          
          {packConfig.cost.gachaTickets && (
            <Button
              onClick={() => onPurchase(packType, 'tickets')}
              disabled={disabled || !canAffordTickets}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Ticket className="w-5 h-5 mr-2" />
              {packConfig.cost.gachaTickets} TICKETS
              {!canAffordTickets && (
                <span className="ml-2 text-red-300 text-sm">
                  (Need {packConfig.cost.gachaTickets - userTickets} more)
                </span>
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {/* Animated glow effect for legendary packs */}
      {packType === 'legendary' && (
        <div className="absolute inset-0 rounded-lg animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-lg blur-xl"></div>
        </div>
      )}
    </Card>
  );
};

export default BoosterPackCard; 