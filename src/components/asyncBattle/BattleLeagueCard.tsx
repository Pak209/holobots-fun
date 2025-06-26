import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sword, 
  Activity, 
  Trophy, 
  Lock,
  Zap,
  Coins,
  Star
} from "lucide-react";
import { LeagueType, LEAGUE_CONFIGS } from "@/types/asyncBattle";
import { UserHolobot } from "@/types/user";
import { HolobotSelector } from "@/components/asyncBattle/HolobotSelector";
import { cn } from "@/lib/utils";
import { useAsyncBattleStore } from "@/stores/asyncBattleStore";
import { useToast } from "@/hooks/use-toast";

interface BattleLeagueCardProps {
  leagueType: LeagueType;
  config: typeof LEAGUE_CONFIGS[LeagueType];
  userSteps: number;
  ticketsRemaining: number;
  userHolobots: UserHolobot[];
}

export function BattleLeagueCard({ 
  leagueType, 
  config, 
  userSteps, 
  ticketsRemaining, 
  userHolobots 
}: BattleLeagueCardProps) {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const { enterBattleLeague } = useAsyncBattleStore();
  const { toast } = useToast();

  const canEnter = userSteps >= config.minSteps && ticketsRemaining > 0;
  const stepsProgress = Math.min(100, (userSteps / config.minSteps) * 100);

  const getDifficultyColor = () => {
    switch (leagueType) {
      case 'junkyard': return 'border-green-500/50 bg-green-900/20';
      case 'city_scraps': return 'border-yellow-500/50 bg-yellow-900/20';
      case 'neon_core': return 'border-orange-500/50 bg-orange-900/20';
      case 'overlord': return 'border-red-500/50 bg-red-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const getDifficultyTextColor = () => {
    switch (leagueType) {
      case 'junkyard': return 'text-green-400';
      case 'city_scraps': return 'text-yellow-400';
      case 'neon_core': return 'text-orange-400';
      case 'overlord': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleEnterLeague = async () => {
    if (!selectedHolobot) {
      toast({
        title: "No Holobot Selected",
        description: "Please select a Holobot to enter the league",
        variant: "destructive"
      });
      return;
    }

    if (!canEnter) {
      toast({
        title: "Cannot Enter League",
        description: `You need ${config.minSteps} steps and at least 1 battle ticket`,
        variant: "destructive"
      });
      return;
    }

    setIsEntering(true);
    try {
      await enterBattleLeague(1, selectedHolobot); // Mock league ID
      toast({
        title: "Entered League!",
        description: `Your ${selectedHolobot} has been entered into ${config.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Enter League",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsEntering(false);
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-2",
      getDifficultyColor(),
      !canEnter && "opacity-75"
    )}>
      {/* League Badge */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "text-2xl rounded-full w-12 h-12 flex items-center justify-center",
          getDifficultyColor()
        )}>
          {config.icon}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Sword className={cn("h-5 w-5", getDifficultyTextColor())} />
          <CardTitle className={cn("text-lg", getDifficultyTextColor())}>
            {config.name}
          </CardTitle>
        </div>
        <CardDescription className="text-sm">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Requirements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Steps Required</span>
            <span className={cn(
              "font-bold",
              userSteps >= config.minSteps ? "text-green-400" : "text-red-400"
            )}>
              {userSteps.toLocaleString()}/{config.minSteps.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={stepsProgress} 
            className="h-2" 
          />
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Energy Cost</span>
            <span className="text-yellow-400">{config.energyCost}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">CPU Level Range</span>
            <span className="text-purple-400">
              {config.cpuLevelRange[0]}-{config.cpuLevelRange[1]}
            </span>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
          <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Rewards
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-300">Holos</span>
              </div>
              <span className="text-sm font-bold text-yellow-400">{config.rewards.holos}</span>
            </div>
            <div className="flex items-center justify-between bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-300">EXP</span>
              </div>
              <span className="text-sm font-bold text-purple-400">{config.rewards.exp}</span>
            </div>
            {config.rewards.parts && (
              <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs text-gray-300">Parts</span>
                </div>
                <span className="text-sm font-bold text-cyan-400">{config.rewards.parts}</span>
              </div>
            )}
            {config.rewards.legendary_parts && (
              <div className="flex items-center justify-between bg-orange-500/10 rounded-lg p-2 border border-orange-500/20">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-gray-300">Legendary</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{config.rewards.legendary_parts}</span>
              </div>
            )}
          </div>
        </div>

        {/* Holobot Selection */}
        {canEnter && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Select Holobot
            </label>
            <HolobotSelector
              holobots={userHolobots}
              selectedHolobot={selectedHolobot}
              onSelect={setSelectedHolobot}
            />
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleEnterLeague}
          disabled={!canEnter || isEntering || !selectedHolobot}
          className={cn(
            "w-full",
            canEnter 
              ? cn("bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700", getDifficultyTextColor())
              : "bg-gray-700 text-gray-400"
          )}
        >
          {!canEnter ? (
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Requirements Not Met</span>
            </div>
          ) : isEntering ? (
            "Entering League..."
          ) : (
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Enter League</span>
            </div>
          )}
        </Button>

        {!canEnter && (
          <div className="text-xs text-gray-400 text-center">
            {userSteps < config.minSteps && `Need ${(config.minSteps - userSteps).toLocaleString()} more steps`}
            {userSteps >= config.minSteps && ticketsRemaining === 0 && "No battle tickets remaining"}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 