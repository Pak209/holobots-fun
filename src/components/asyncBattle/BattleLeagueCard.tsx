import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Trophy, 
  Lock,
  Coins,
  Crown,
  Star,
  Users,
  Swords
} from "lucide-react";
import { LeagueType, LEAGUE_CONFIGS } from "@/types/asyncBattle";
import { UserHolobot } from "@/types/user";
import { PlayerRank, PLAYER_RANKS } from "@/types/playerRank";
import { PlayerRankBadge } from "@/components/PlayerRankBadge";
import { HolobotSelector } from "./HolobotSelector";
import { cn } from "@/lib/utils";
import { useAsyncBattleStore } from "@/stores/asyncBattleStore";
import { useToast } from "@/hooks/use-toast";

interface BattleLeagueCardProps {
  leagueType: LeagueType;
  config: typeof LEAGUE_CONFIGS[LeagueType];
  userPlayerRank: PlayerRank;
  ticketsRemaining: number;
  userHolobots: UserHolobot[];
  leagueId: number; // Add league ID to fetch battle counts
}

// Helper function to compare player ranks
const getPlayerRankOrder = (rank: string): number => {
  const rankOrder = {
    'Rookie': 0,
    'Champion': 1,
    'Rare': 2,
    'Elite': 3,
    'Legend': 4,
    'Mythic': 5
  };
  return rankOrder[rank as keyof typeof rankOrder] || 0;
};

export const BattleLeagueCard: React.FC<BattleLeagueCardProps> = ({ 
  leagueType, 
  config,
  userPlayerRank,
  ticketsRemaining,
  userHolobots,
  leagueId 
}) => {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [activeBattleCount, setActiveBattleCount] = useState<number>(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const { enterBattleLeague, getLeagueBattleCounts } = useAsyncBattleStore();
  const { toast } = useToast();

  // Fetch battle counts when component mounts
  useEffect(() => {
    const fetchBattleCounts = async () => {
      setIsLoadingCounts(true);
      try {
        const counts = await getLeagueBattleCounts();
        setActiveBattleCount(counts[leagueId] || 0);
      } catch (error) {
        console.error('Failed to fetch battle counts:', error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchBattleCounts();
  }, [leagueId, getLeagueBattleCounts]);

  const requiredRankOrder = getPlayerRankOrder(config.minPlayerRank);
  const userRankOrder = getPlayerRankOrder(userPlayerRank);
  const hasRequiredRank = userRankOrder >= requiredRankOrder;
  const canEnter = hasRequiredRank && ticketsRemaining > 0;

  const getLeagueColor = () => {
    switch (leagueType) {
      case 'junkyard': return 'border-green-500/50 bg-green-900/20';
      case 'city_scraps': return 'border-blue-500/50 bg-blue-900/20';
      case 'neon_core': return 'border-purple-500/50 bg-purple-900/20';
      case 'overlord': return 'border-orange-500/50 bg-orange-900/20';
      default: return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const getLeagueTextColor = () => {
    switch (leagueType) {
      case 'junkyard': return 'text-green-400';
      case 'city_scraps': return 'text-blue-400';
      case 'neon_core': return 'text-purple-400';
      case 'overlord': return 'text-orange-400';
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
        description: `You need ${config.minPlayerRank} rank and at least 1 battle ticket`,
        variant: "destructive"
      });
      return;
    }

    setIsEntering(true);
    try {
      await enterBattleLeague(leagueId, selectedHolobot);
      toast({
        title: "Entered League!",
        description: `Your ${selectedHolobot} has been entered into ${config.name}`,
      });
      
      // Refresh battle count after successful entry
      const counts = await getLeagueBattleCounts();
      setActiveBattleCount(counts[leagueId] || 0);
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
      getLeagueColor(),
      !canEnter && "opacity-75"
    )}>
      {/* League Badge */}
      <div className="absolute top-4 right-4">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs font-bold",
            !canEnter ? "border-gray-500 text-gray-400" : "border-yellow-500 text-yellow-400"
          )}
        >
          {!canEnter ? 'LOCKED' : 'AVAILABLE'}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{config.icon}</span>
          <CardTitle className={cn("text-lg", getLeagueTextColor())}>
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
            <span className="text-gray-400">Player Rank Required:</span>
            <div className="flex items-center space-x-2">
              <PlayerRankBadge rank={config.minPlayerRank as PlayerRank} size="sm" />
              <span className={cn(
                "text-xs",
                hasRequiredRank ? "text-green-400" : "text-red-400"
              )}>
                {hasRequiredRank ? "✓ Met" : "✗ Not Met"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Your Rank:</span>
            <PlayerRankBadge rank={userPlayerRank} size="sm" />
          </div>
        </div>

        {/* League Info Dashboard */}
        <div className="bg-black/40 rounded-lg p-3 border border-cyan-500/30">
          <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center">
            <Swords className="h-4 w-4 mr-2" />
            League Info
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-cyan-400" />
                <span className="text-xs text-gray-300">Active Battles</span>
              </div>
              <span className="text-sm font-bold text-cyan-400">
                {isLoadingCounts ? '...' : activeBattleCount}
              </span>
            </div>
            <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-2 border border-green-500/20">
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-300">Reset</span>
              </div>
              <span className="text-sm font-bold text-green-400">24h</span>
            </div>
          </div>
          {activeBattleCount === 0 && (
            <p className="text-xs text-gray-400 text-center mt-2">
              No active battles yet. Be the first to enter!
            </p>
          )}
        </div>

        {/* Rewards */}
        <div className="bg-black/60 rounded-lg p-4 border border-yellow-500/30">
          <h4 className="text-sm font-bold text-yellow-400 mb-3 flex items-center">
            <Trophy className="h-4 w-4 mr-2" />
            Rewards
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-yellow-500/10 rounded-lg p-2 border border-yellow-500/20">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-gray-300">{config.rewards.boosters}</span>
              </div>
              <span className="text-sm font-bold text-yellow-400">{config.rewards.booster_count}</span>
            </div>
            <div className="flex items-center justify-between bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-gray-300">EXP</span>
              </div>
              <span className="text-sm font-bold text-blue-400">{config.rewards.exp}</span>
            </div>
            {config.rewards.parts && (
              <div className="flex items-center justify-between bg-purple-500/10 rounded-lg p-2 border border-purple-500/20">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-300">Parts</span>
                </div>
                <span className="text-sm font-bold text-purple-400">{config.rewards.parts}</span>
              </div>
            )}
            {config.rewards.legendary_parts && (
              <div className="flex items-center justify-between bg-orange-500/10 rounded-lg p-2 border border-orange-500/20">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-orange-400" />
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
              ? cn("bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700", getLeagueTextColor())
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
              <Crown className="h-4 w-4" />
              <span>Enter League</span>
            </div>
          )}
        </Button>

        {!canEnter && (
          <div className="text-xs text-gray-400 text-center">
            {!hasRequiredRank && `Need ${config.minPlayerRank} rank or higher`}
            {hasRequiredRank && ticketsRemaining === 0 && "No battle tickets remaining"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 