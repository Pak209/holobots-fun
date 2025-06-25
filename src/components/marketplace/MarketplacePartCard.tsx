import { useState } from "react";
import { MarketplacePart, MarketplacePartTier } from "@/data/marketplaceParts";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, Shield, Gauge, Brain } from "lucide-react";

interface MarketplacePartCardProps {
  part: MarketplacePart;
  onBuy: (partId: string, tier: string) => void;
  isBuying?: boolean;
}

const tierColors = {
  common: "text-gray-400 border-gray-600",
  rare: "text-blue-400 border-blue-600",
  epic: "text-purple-400 border-purple-600", 
  legendary: "text-yellow-400 border-yellow-600",
  mythic: "text-red-400 border-red-600",
};

const tierGlows = {
  common: "shadow-gray-500/20",
  rare: "shadow-blue-500/30",
  epic: "shadow-purple-500/30",
  legendary: "shadow-yellow-500/30",
  mythic: "shadow-red-500/40",
};

const slotIcons = {
  head: Brain,
  torso: Shield,
  arms: Zap,
  legs: Gauge,
  core: Zap,
};

export function MarketplacePartCard({ part, onBuy, isBuying }: MarketplacePartCardProps) {
  const [selectedTier, setSelectedTier] = useState<string>("");
  
  const selectedTierData = part.tiers.find(t => t.tier === selectedTier);
  const SlotIcon = slotIcons[part.slot];
  
  const getTierMultiplier = (tier: string) => {
    const multipliers = {
      common: 1,
      rare: 1.1,
      epic: 1.2,
      legendary: 1.3,
      mythic: 1.4,
    };
    return multipliers[tier as keyof typeof multipliers] || 1;
  };

  const getDisplayStats = () => {
    if (!selectedTier) return part.baseStats;
    
    const multiplier = getTierMultiplier(selectedTier);
    return {
      attack: Math.floor(part.baseStats.attack * multiplier),
      defense: Math.floor(part.baseStats.defense * multiplier),
      speed: Math.floor(part.baseStats.speed * multiplier),
      intelligence: Math.floor(part.baseStats.intelligence * multiplier),
    };
  };

  const handlePurchase = () => {
    if (selectedTier) {
      onBuy(part.id, selectedTier);
    }
  };

  const displayStats = getDisplayStats();

  return (
    <div className={`bg-[#1A1F2C] rounded-lg border overflow-hidden transition-all duration-300 ${
      selectedTier ? `${tierColors[selectedTier as keyof typeof tierColors]} ${tierGlows[selectedTier as keyof typeof tierGlows]}` : 'border-cyan-900/30'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <SlotIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">{part.name}</h3>
          </div>
          <Badge variant="outline" className="text-cyan-400 border-cyan-600">
            {part.slot.toUpperCase()}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4">{part.description}</p>

        {/* Tier Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Select Tier:
          </label>
          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-full bg-black/40 border-cyan-900/30">
              <SelectValue placeholder="Choose tier..." />
            </SelectTrigger>
            <SelectContent>
              {part.tiers.map((tierData) => (
                <SelectItem key={tierData.tier} value={tierData.tier}>
                  <div className="flex items-center justify-between w-full">
                    <span className={`capitalize font-medium ${
                      tierColors[tierData.tier as keyof typeof tierColors].split(' ')[0]
                    }`}>
                      {tierData.tier}
                    </span>
                    <span className="ml-4 text-yellow-400 font-bold">
                      {tierData.price} HOLOS
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Display */}
        {selectedTier && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black/40 rounded p-2">
              <div className="flex items-center text-red-400 text-sm">
                <Zap className="w-4 h-4 mr-1" />
                Attack: {displayStats.attack}
              </div>
            </div>
            <div className="bg-black/40 rounded p-2">
              <div className="flex items-center text-blue-400 text-sm">
                <Shield className="w-4 h-4 mr-1" />
                Defense: {displayStats.defense}
              </div>
            </div>
            <div className="bg-black/40 rounded p-2">
              <div className="flex items-center text-green-400 text-sm">
                <Gauge className="w-4 h-4 mr-1" />
                Speed: {displayStats.speed}
              </div>
            </div>
            <div className="bg-black/40 rounded p-2">
              <div className="flex items-center text-purple-400 text-sm">
                <Brain className="w-4 h-4 mr-1" />
                Intelligence: {displayStats.intelligence}
              </div>
            </div>
          </div>
        )}

        {/* Special Abilities */}
        {part.passiveTraits && part.passiveTraits.length > 0 && selectedTier && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-cyan-400 mb-2">Passive Abilities:</h4>
            <div className="space-y-1">
              {part.passiveTraits.map((trait) => (
                <div key={trait.id} className="bg-black/40 rounded p-2">
                  <div className="text-xs font-medium text-yellow-400">{trait.name}</div>
                  <div className="text-xs text-gray-300">{trait.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Attack */}
        {part.specialAttackVariant && selectedTier && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-cyan-400 mb-2">Special Attack:</h4>
            <div className="bg-black/40 rounded p-2">
              <div className="text-xs font-medium text-yellow-400">
                {part.specialAttackVariant.name} ({part.specialAttackVariant.elementType})
              </div>
              <div className="text-xs text-gray-300">
                Base Damage: {part.specialAttackVariant.baseDamage}
              </div>
            </div>
          </div>
        )}

        {/* Purchase Section */}
        <div className="pt-3 border-t border-gray-700">
          {selectedTierData && (
            <div className="flex items-center justify-between mb-3">
              <div className="text-yellow-400 font-bold text-lg">
                {selectedTierData.price} HOLOS
              </div>
              <Badge 
                variant="outline" 
                className={`capitalize ${tierColors[selectedTier as keyof typeof tierColors]}`}
              >
                {selectedTier}
              </Badge>
            </div>
          )}
          
          <Button
            onClick={handlePurchase}
            disabled={!selectedTier || isBuying}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white disabled:opacity-50"
          >
            {isBuying ? "Purchasing..." : selectedTier ? "Purchase Part" : "Select Tier First"}
          </Button>
        </div>
      </div>
    </div>
  );
} 