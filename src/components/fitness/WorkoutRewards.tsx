
import { Sparkles, Award, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutRewardsProps {
  rewards: {
    exp: number;
    holos: number;
    attributeBoosts: number;
  };
  className?: string;
}

export function WorkoutRewards({ rewards, className }: WorkoutRewardsProps) {
  return (
    <div className={cn("bg-black/40 rounded-lg p-3 border border-cyan-500/20", className)}>
      <h3 className="text-xs text-cyan-400 mb-3">REWARDS</h3>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-1">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <span className="text-xs text-gray-300">EXP</span>
          <span className="text-sm font-bold">{rewards.exp.toFixed(0)}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-1">
            <Award className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="text-xs text-gray-300">HOLOS</span>
          <span className="text-sm font-bold">{rewards.holos}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
            <Zap className="h-5 w-5 text-green-400" />
          </div>
          <span className="text-xs text-gray-300">BOOSTS</span>
          <span className="text-sm font-bold">{rewards.attributeBoosts}</span>
        </div>
      </div>
    </div>
  );
}
