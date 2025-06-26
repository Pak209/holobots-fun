import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Activity, 
  Trophy, 
  Lock,
  Star,
  Coins,
  TrendingUp
} from "lucide-react";
import { BattlePoolType, POOL_CONFIGS } from "@/types/asyncBattle";
import { UserHolobot } from "@/types/user";
import { HolobotSelector } from "./HolobotSelector";
import { cn } from "@/lib/utils";
import { useAsyncBattleStore } from "@/stores/asyncBattleStore";
import { useToast } from "@/hooks/use-toast";

interface BattlePoolCardProps {
  poolType: BattlePoolType;
  config: typeof POOL_CONFIGS[BattlePoolType];
  userSteps: number;
  ticketsRemaining: number;
  userHolobots: UserHolobot[];
}

export function BattlePoolCard({ 
  poolType, 
  config, 
  userSteps, 
  ticketsRemaining, 
  userHolobots 
}: BattlePoolCardProps) {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const { enterBattlePool } = useAsyncBattleStore();
  const { toast } = useToast();

  const minSteps = config.entryRequirements.min_steps || 0;
  const canEnter = userSteps >= minSteps && ticketsRemaining > 0;
  const stepsProgress = minSteps > 0 ? Math.min(100, (userSteps / minSteps) * 100) : 100;

  const getPoolColor = () => {
    switch (poolType) {
      case 'casual': return 'border-blue-500/50 bg-blue-900/20';
      case 'ranked': return 'border-purple-500/50 bg-purple-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const getPoolTextColor = () => {
    switch (poolType) {
      case 'casual': return 'text-blue-400';
      case 'ranked': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const handleEnterPool = async () => {
    if (!selectedHolobot) {
      toast({
        title: "No Holobot Selected",
        description: "Please select a Holobot to enter the battle pool",
        variant: "destructive"
      });
      return;
    }

    if (!canEnter) {
      toast({
        title: "Cannot Enter Pool",
        description: `You need ${minSteps} steps and at least 1 battle ticket`,
        variant: "destructive"
      });
      return;
    }

    setIsEntering(true);
    try {
      await enterBattlePool(1, selectedHolobot); // Mock pool ID
      toast({
        title: "Entered Battle Pool!",
        description: `Your ${selectedHolobot} has been entered into ${config.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Enter Pool",
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
      getPoolColor(),
      !canEnter && "opacity-75"
    )}>
      {/* Pool Badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs font-bold",
            poolType === 'ranked' ? "border-purple-500 text-purple-400" : "border-blue-500 text-blue-400"
          )}
        >
          {poolType === 'ranked' ? 'RANKED' : 'CASUAL'}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Users className={cn("h-5 w-5", getPoolTextColor())} />
          <CardTitle className={cn("text-lg", getPoolTextColor())}>
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
            <span className="text-gray-400">Level Required</span>
            <span className="text-cyan-400">
              {config.entryRequirements.min_level || 1}+
            </span>
          </div>
          
          {minSteps > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Steps Required</span>
                <span className={cn(
                  "font-bold",
                  userSteps >= minSteps ? "text-green-400" : "text-red-400"
                )}>
                  {userSteps.toLocaleString()}/{minSteps.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={stepsProgress} 
                className="h-2" 
              />
            </>
          )}

          {config.entryRequirements.min_rating && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Rating Required</span>
              <span className="text-orange-400">
                {config.entryRequirements.min_rating}+
              </span>
            </div>
          )}
        </div>

        {/* Pool Stats */}
        <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
          <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Pool Info
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Players</span>
              </div>
              <span className="text-lg font-bold text-blue-400">24</span>
            </div>
            <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-400" />
                <span className="text-sm text-gray-300">Reset</span>
              </div>
              <span className="text-lg font-bold text-green-400">24h</span>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center">
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
            {config.rewards.rating_points && (
              <>
                <div className="flex items-center justify-between bg-orange-500/10 rounded-lg p-2 border border-orange-500/20">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-gray-300">Rating</span>
                  </div>
                  <span className="text-sm font-bold text-orange-400">+{config.rewards.rating_points}</span>
                </div>
                <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-gray-300">Rank</span>
                  </div>
                  <span className="text-sm font-bold text-cyan-400">Progress</span>
                </div>
              </>
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
          onClick={handleEnterPool}
          disabled={!canEnter || isEntering || !selectedHolobot}
          className={cn(
            "w-full",
            canEnter 
              ? cn("bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700", getPoolTextColor())
              : "bg-gray-700 text-gray-400"
          )}
        >
          {!canEnter ? (
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Requirements Not Met</span>
            </div>
          ) : isEntering ? (
            "Entering Pool..."
          ) : (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Enter Battle Pool</span>
            </div>
          )}
        </Button>

        {!canEnter && (
          <div className="text-xs text-gray-400 text-center">
            {userSteps < minSteps && minSteps > 0 && `Need ${(minSteps - userSteps).toLocaleString()} more steps`}
            {(userSteps >= minSteps || minSteps === 0) && ticketsRemaining === 0 && "No battle tickets remaining"}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 