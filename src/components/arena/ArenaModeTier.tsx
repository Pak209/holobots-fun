
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Trophy, Target, Swords } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ArenaModeTierProps {
  tier: string;
  data: {
    name: string;
    levelRange: [number, number];
    description: string;
    maxRounds: number;
    rewards: {
      baseHolos: number;
      expMultiplier: number;
      blueprintChance: number;
      itemTypes: string[];
    };
  };
  onSelect: (tier: string) => void;
  isSelected: boolean;
  isLocked?: boolean;
}

export const ArenaModeTier = ({
  tier,
  data,
  onSelect,
  isSelected,
  isLocked = false
}: ArenaModeTierProps) => {
  const getTierIcon = () => {
    switch(tier) {
      case 'bronze': return <Shield className="h-5 w-5 text-amber-600" />;
      case 'silver': return <Target className="h-5 w-5 text-zinc-400" />;
      case 'gold': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'platinum': return <Swords className="h-5 w-5 text-cyan-400" />;
      default: return <Shield className="h-5 w-5 text-amber-600" />;
    }
  };

  const getTierColor = () => {
    switch(tier) {
      case 'bronze': return "border-amber-600/30 hover:border-amber-600/60";
      case 'silver': return "border-zinc-400/30 hover:border-zinc-400/60";
      case 'gold': return "border-yellow-500/30 hover:border-yellow-500/60";
      case 'platinum': return "border-cyan-400/30 hover:border-cyan-400/60";
      default: return "border-amber-600/30 hover:border-amber-600/60";
    }
  };

  return (
    <Card 
      className={`bg-black/40 backdrop-blur-sm cursor-pointer transition-all 
        ${getTierColor()} 
        ${isSelected ? 'shadow-neon border-2' : 'border'} 
        ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={() => !isLocked && onSelect(tier)}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getTierIcon()}
            <span className="text-white">{data.name}</span>
          </CardTitle>

          <Badge className="bg-holobots-accent text-black font-bold">
            Lv.{data.levelRange[0]}-{data.levelRange[1]}
          </Badge>
        </div>
        <CardDescription className="mt-1">
          {data.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              ×{data.maxRounds}
            </Badge>
            <span className="text-gray-400">Max Rounds</span>
          </p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            <div className="flex items-center bg-holobots-accent/10 rounded-full px-2 py-1">
              <Trophy className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs">{data.rewards.baseHolos} HOLOS</span>
            </div>
            
            <div className="flex items-center bg-holobots-accent/10 rounded-full px-2 py-1">
              <Target className="h-3 w-3 text-blue-400 mr-1" />
              <span className="text-xs">×{data.rewards.expMultiplier} XP</span>
            </div>
            
            <div className="flex items-center bg-holobots-accent/10 rounded-full px-2 py-1">
              <Shield className="h-3 w-3 text-purple-400 mr-1" />
              <span className="text-xs">{Math.floor(data.rewards.blueprintChance * 100)}% BP</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
