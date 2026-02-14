import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BoosterPackResult, BoosterPackItem } from '../../types/boosterPack';
import { Sparkles, X, Package, Zap } from 'lucide-react';
import { useHolobotPartsStore } from '../../stores/holobotPartsStore';
import { useAuth } from '../../contexts/auth';

interface PackOpeningAnimationProps {
  result: BoosterPackResult | null;
  isOpening: boolean;
  onClose: () => void;
  onEquipPart?: (item: BoosterPackItem) => void;
}

const PackOpeningAnimation: React.FC<PackOpeningAnimationProps> = ({
  result,
  isOpening,
  onClose,
  onEquipPart
}) => {
  const [stage, setStage] = useState<'opening' | 'revealing' | 'complete'>('opening');
  const [revealedItems, setRevealedItems] = useState<BoosterPackItem[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const { addPart } = useHolobotPartsStore();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (isOpening) {
      setStage('opening');
      setRevealedItems([]);
      setCurrentRevealIndex(0);
    }
  }, [isOpening]);

  useEffect(() => {
    if (result && stage === 'opening') {
      // Start revealing items after opening animation
      const timer = setTimeout(() => {
        setStage('revealing');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [result, stage]);

  useEffect(() => {
    if (stage === 'revealing' && result && currentRevealIndex < result.items.length) {
      const timer = setTimeout(() => {
        const item = result.items[currentRevealIndex];
        setRevealedItems(prev => [...prev, item]);
        
        // Add items to user inventory
        if (item.type === 'part' && item.part) {
          addPart(item.part);
          // Also save to database
          if (user) {
            const updatedParts = [...(user.parts || []), item.part];
            updateUser({ parts: updatedParts }).catch(err => 
              console.warn("Failed to save part to database:", err)
            );
          }
        } else if (item.type === 'currency') {
          if (item.holosTokens && user) {
            updateUser({ holosTokens: (user.holosTokens || 0) + item.holosTokens });
          }
          // TODO: Add gacha tickets to user profile when implemented
        }
        
        setCurrentRevealIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (stage === 'revealing' && result && currentRevealIndex >= result.items.length) {
      setStage('complete');
    }
  }, [stage, currentRevealIndex, result, addPart, user, updateUser]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'common': return 'text-gray-400 border-gray-400 bg-gray-900/50';
      case 'rare': return 'text-blue-400 border-blue-400 bg-blue-900/50';
      case 'epic': return 'text-purple-400 border-purple-400 bg-purple-900/50';
      case 'legendary': return 'text-yellow-400 border-yellow-400 bg-yellow-900/50';
      case 'mythic': return 'text-pink-400 border-pink-400 bg-pink-900/50';
      default: return 'text-gray-400 border-gray-400 bg-gray-900/50';
    }
  };

  const getItemIcon = (item: BoosterPackItem) => {
    // For parts, show the actual part image if available
    if (item.type === 'part' && item.part) {
      // Remove tier suffix if present
      const basePartName = item.part.name.replace(/\s*\([^)]*\)\s*$/i, '').trim();
      
      const partImageMap: Record<string, string> = {
        // Arms parts
        'Plasma Cannon': '/icons/ArmPartPlasmaCannon.png',
        'Plasma Cannons': '/icons/ArmPartPlasmaCannon.png',
        'Boxer Gloves': '/icons/ArmsPartBoxer.png',
        'Inferno Claws': '/icons/ArmsPartInfernoClaws.png',
        // Head parts
        'Combat Mask': '/icons/HeadPartCombatMask.png',
        'Void Mask': '/icons/HeadPartVoidMask.png',
        'Advanced Scanner': '/icons/HeadPartCombatMask.png',
        // Torso parts
        'Titanium Torso': '/icons/TorsoPart.png',
        'Steel Torso': '/icons/TorsoPart.png',
        'Reinforced Chassis': '/icons/TorsoPart.png',
        // Legs parts
        'Power Legs': '/icons/LegPart.png',
        'Speed Legs': '/icons/LegPart.png',
        'Turbo Boosters': '/icons/LegPart.png',
        // Core parts
        'Energy Core': '/icons/CorePart.png',
        'Power Core': '/icons/CorePart.png',
        'Quantum Core': '/icons/CorePart.png',
      };
      
      const imagePath = partImageMap[basePartName];
      if (imagePath) {
        return <img src={imagePath} alt={item.part.name} className="w-full h-full object-contain" />;
      }
    }
    
    // For blueprints, show the Blueprint.png
    if (item.type === 'blueprint') {
      return <img src="/icons/Blueprint.png" alt="Blueprint" className="w-full h-full object-contain" />;
    }
    
    // For items, show the actual item images
    if (item.type === 'item' && item.itemType) {
      const itemImageMap: Record<string, string> = {
        'arena_pass': '/icons/ArenaPass.jpeg',
        'energy_refill': '/icons/EnergyRefill.jpeg',
        'exp_booster': '/icons/EXPboost.jpeg',
        'rank_skip': '/icons/RankSkip.jpeg',
      };
      
      const imagePath = itemImageMap[item.itemType];
      if (imagePath) {
        return <img src={imagePath} alt={item.name} className="w-full h-full object-contain" />;
      }
    }
    
    // Fallback to emojis for other types
    switch (item.type) {
      case 'part': return '⚙️';
      case 'blueprint': return '📋';
      case 'currency': return item.holosTokens ? '🪙' : '🎫';
      case 'item': return '🎁';
      default: return '❓';
    }
  };

  if (!result && !isOpening) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Opening Animation */}
        {stage === 'opening' && (
          <div className="text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg border-4 border-white/20 shadow-2xl animate-bounce">
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-white animate-spin" />
                </div>
              </div>
              <div className="absolute inset-0 animate-ping">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-600/50 to-purple-600/50 rounded-lg"></div>
              </div>
            </div>
            <h2 className="text-4xl font-black text-white mb-4 animate-pulse">
              OPENING PACK...
            </h2>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Revealing Animation */}
        {stage === 'revealing' && (
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-8">
              YOUR REWARDS!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {revealedItems.map((item, index) => (
                <Card 
                  key={item.id}
                  className={`${getTierColor(item.tier)} border-2 shadow-2xl transform animate-fade-in-scale relative overflow-hidden`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Sparkle effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-400 animate-pulse" />
                    <Sparkles className="absolute bottom-2 left-2 w-4 h-4 text-white animate-pulse" style={{ animationDelay: '500ms' }} />
                  </div>
                  
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4 animate-bounce">
                      {getItemIcon(item)}
                    </div>
                    <Badge variant="outline" className={`mb-3 ${getTierColor(item.tier)} font-bold text-lg px-3 py-1`}>
                      {item.tier.toUpperCase()}
                    </Badge>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {item.description}
                    </p>
                    {item.quantity > 1 && (
                      <div className="text-lg font-bold text-green-400">
                        x{item.quantity}
                      </div>
                    )}
                    
                    {/* Equip button for parts */}
                    {item.type === 'part' && onEquipPart && (
                      <Button
                        onClick={() => onEquipPart(item)}
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        EQUIP NOW
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Placeholder cards for items not yet revealed */}
              {result && Array.from({ length: result.items.length - revealedItems.length }).map((_, index) => (
                <Card 
                  key={`placeholder-${index}`}
                  className="border-2 border-gray-600 bg-gray-900/50 shadow-2xl animate-pulse"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-600 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Complete Stage */}
        {stage === 'complete' && result && (
          <div className="text-center">
            <h2 className="text-4xl font-black text-white mb-8">
              PACK OPENED!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {result.items.map((item, index) => (
                <Card 
                  key={item.id}
                  className={`${getTierColor(item.tier)} border-2 shadow-2xl relative overflow-hidden`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-6xl mb-4">
                      {getItemIcon(item)}
                    </div>
                    <Badge variant="outline" className={`mb-3 ${getTierColor(item.tier)} font-bold text-lg px-3 py-1`}>
                      {item.tier.toUpperCase()}
                    </Badge>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {item.description}
                    </p>
                    {item.quantity > 1 && (
                      <div className="text-lg font-bold text-green-400">
                        x{item.quantity}
                      </div>
                    )}
                    
                    {/* Equip button for parts */}
                    {item.type === 'part' && onEquipPart && (
                      <Button
                        onClick={() => onEquipPart(item)}
                        className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        EQUIP NOW
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg"
            >
              <X className="w-5 h-5 mr-2" />
              CLOSE
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PackOpeningAnimation; 