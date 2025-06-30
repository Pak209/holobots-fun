import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { useAuth } from "@/contexts/auth";
import { calculateAttributeUpgradeCost, DEFAULT_SYNC_CONFIG } from "@/types/syncPoints";
import { 
  Sword, 
  Shield, 
  Zap, 
  Heart, 
  Star,
  TrendingUp,
  Lock,
  Unlock
} from "lucide-react";

const ATTRIBUTE_ICONS = {
  hp: Heart,
  attack: Sword,
  defense: Shield,
  speed: Zap,
  special: Star,
};

const ATTRIBUTE_COLORS = {
  hp: "text-red-400",
  attack: "text-orange-400", 
  defense: "text-blue-400",
  speed: "text-green-400",
  special: "text-purple-400",
};

const ATTRIBUTE_NAMES = {
  hp: "HEALTH",
  attack: "ATTACK",
  defense: "DEFENSE", 
  speed: "SPEED",
  special: "SPECIAL",
};

interface AttributeUpgradeProps {
  holobotId: string;
  holobotName: string;
}

export function AttributeUpgrade({ holobotId, holobotName }: AttributeUpgradeProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    upgradeAttribute, 
    getHolobotAttributeLevel, 
    getAvailableSyncPoints,
    canAffordUpgrade,
    getHolobotSyncBond
  } = useSyncPointsStore();
  
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const availableSP = getAvailableSyncPoints();
  const syncBond = getHolobotSyncBond(holobotId);

  const attributes = ['hp', 'attack', 'defense', 'speed', 'special'] as const;

  const handleUpgrade = (attribute: typeof attributes[number]) => {
    const currentLevel = getHolobotAttributeLevel(holobotId, attribute);
    const cost = calculateAttributeUpgradeCost(currentLevel);
    
    if (upgradeAttribute(holobotId, attribute)) {
      toast({
        title: "Attribute Upgraded!",
        description: `${ATTRIBUTE_NAMES[attribute]} upgraded to level ${currentLevel + 1} for ${cost} SP`,
      });
    } else {
      toast({
        title: "Upgrade Failed",
        description: "Not enough Sync Points or attribute already maxed",
        variant: "destructive",
      });
    }
  };

  const getTotalInvestment = () => {
    return attributes.reduce((total, attr) => {
      const level = getHolobotAttributeLevel(holobotId, attr);
      return total + (DEFAULT_SYNC_CONFIG.attributeUpgradeCosts.slice(0, level).reduce((sum, cost) => sum + cost, 0));
    }, 0);
  };

  const getAttributeStrategy = () => {
    const levels = attributes.map(attr => getHolobotAttributeLevel(holobotId, attr));
    const maxLevel = Math.max(...levels);
    const maxCount = levels.filter(level => level === maxLevel).length;
    
    if (maxLevel >= 8) return "Elite Build";
    if (maxLevel >= 5) return "Specialized Build";
    if (maxLevel >= 3) return "Balanced Build";
    return "Beginner Build";
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          ATTRIBUTE UPGRADES - {holobotName}
        </CardTitle>
        <div className="flex justify-between text-sm">
          <span className="text-cyan-300">Available SP: {availableSP}</span>
          <span className="text-cyan-300">Total Invested: {getTotalInvestment()}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Bond Display */}
        <div className="p-3 bg-black/40 rounded-lg border border-purple-500/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-400 text-sm">SYNC BOND</span>
            <Badge className="bg-purple-500 text-white">
              Level {syncBond.level}
            </Badge>
          </div>
          <Progress value={syncBond.progress} className="h-2 bg-gray-800" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Ability Boost: +{syncBond.abilityBoost}%</span>
            <span>Part Compat: +{syncBond.partCompatibility}%</span>
          </div>
        </div>

        {/* Strategy Display */}
        <div className="p-2 bg-black/40 rounded-lg border border-yellow-500/20">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 text-sm">BUILD STRATEGY</span>
            <Badge className="bg-yellow-500 text-black">
              {getAttributeStrategy()}
            </Badge>
          </div>
        </div>

        {/* Attribute Grid */}
        <div className="grid grid-cols-1 gap-3">
          {attributes.map((attribute) => {
            const Icon = ATTRIBUTE_ICONS[attribute];
            const currentLevel = getHolobotAttributeLevel(holobotId, attribute);
            const upgradeCost = calculateAttributeUpgradeCost(currentLevel);
            const canUpgrade = canAffordUpgrade(upgradeCost) && currentLevel < DEFAULT_SYNC_CONFIG.maxAttributeLevel;
            const isMaxed = currentLevel >= DEFAULT_SYNC_CONFIG.maxAttributeLevel;
            
            return (
              <div 
                key={attribute}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  selectedAttribute === attribute 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-gray-600 bg-black/40 hover:border-gray-500'
                }`}
                onClick={() => setSelectedAttribute(attribute)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${ATTRIBUTE_COLORS[attribute]}`} />
                    <span className={`text-sm font-medium ${ATTRIBUTE_COLORS[attribute]}`}>
                      {ATTRIBUTE_NAMES[attribute]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isMaxed ? "default" : "outline"} className="text-xs">
                      {isMaxed ? "MAX" : `Lv ${currentLevel}`}
                    </Badge>
                    {isMaxed ? (
                      <Unlock className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={(currentLevel / DEFAULT_SYNC_CONFIG.maxAttributeLevel) * 100} 
                    className="h-2 bg-gray-800"
                  />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {currentLevel}/{DEFAULT_SYNC_CONFIG.maxAttributeLevel}
                    </span>
                    {!isMaxed && (
                      <div className="text-xs text-gray-400">
                        Next: {upgradeCost} SP
                      </div>
                    )}
                  </div>
                  
                  {!isMaxed && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpgrade(attribute);
                      }}
                      disabled={!canUpgrade}
                      className={`w-full h-8 text-xs ${
                        canUpgrade 
                          ? 'bg-cyan-500 hover:bg-cyan-600' 
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {canUpgrade ? `UPGRADE (${upgradeCost} SP)` : 'INSUFFICIENT SP'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Strategy Guide */}
        <div className="p-3 bg-black/40 rounded-lg border border-blue-500/20">
          <div className="text-blue-400 text-sm mb-2">STRATEGY GUIDE</div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Maxed Holobot = 3 attributes fully upgraded, 2 partially</p>
            <p>• Tank Build: Focus HP + Defense</p>
            <p>• DPS Build: Focus Attack + Special</p>
            <p>• Speedster Build: Focus Speed + Attack</p>
            <p>• Sync Bond increases with total SP earned with this Holobot</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 