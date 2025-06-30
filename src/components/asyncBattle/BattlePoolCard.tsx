import { useState, useEffect } from "react";
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
  TrendingUp,
  Eye,
  Crown
} from "lucide-react";
import { BattlePoolType, POOL_CONFIGS } from "@/types/asyncBattle";
import { UserHolobot } from "@/types/user";
import { PlayerRank } from "@/types/playerRank";
import { PlayerRankBadge } from "@/components/PlayerRankBadge";
import { HolobotSelector } from "./HolobotSelector";
import { cn } from "@/lib/utils";
import { useAsyncBattleStore } from "@/stores/asyncBattleStore";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface BattlePoolCardProps {
  poolType: BattlePoolType;
  config: typeof POOL_CONFIGS[BattlePoolType];
  userPlayerRank: PlayerRank;
  ticketsRemaining: number;
  userHolobots: UserHolobot[];
}

interface PoolEntry {
  id: number;
  user_id: string;
  holobot_name: string;
  submitted_at: string;
  profiles?: {
    username?: string;
  };
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

export function BattlePoolCard({ 
  poolType, 
  config, 
  userPlayerRank,
  ticketsRemaining, 
  userHolobots 
}: BattlePoolCardProps) {
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { enterBattlePool } = useAsyncBattleStore();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch real pool entries from Supabase
  useEffect(() => {
    fetchPoolEntries();
  }, [poolType]);

  const fetchPoolEntries = async () => {
    try {
      setLoading(true);
      
      // Get the pool ID based on pool type
      const poolId = poolType === 'casual' ? 1 : 2;
      
      const { data, error } = await supabase
        .from('battle_pool_entries' as any)
        .select(`
          id, 
          user_id, 
          holobot_name, 
          submitted_at, 
          holobot_stats,
          profiles!inner(username)
        `)
        .eq('pool_id', poolId)
        .eq('is_active', true)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching pool entries:', error);
        setPoolEntries([]);
      } else {
        // Format pool entries from battle_pool_entries table
        const poolBattles = ((data as any) || [])
          .map((entry: any) => {
            try {
              return {
                id: entry.id,
                user_id: entry.user_id,
                holobot_name: entry.holobot_name || 'Unknown',
                submitted_at: entry.submitted_at || new Date().toISOString(),
                profiles: {
                  username: entry.profiles?.username || `User ${entry.user_id.slice(-4)}`
                }
              };
            } catch (e) {
              console.error('Error parsing pool entry:', e);
              return null;
            }
          })
          .filter((entry: any) => entry !== null);

        console.log('Fetched pool entries:', poolBattles);
        setPoolEntries(poolBattles as PoolEntry[]);
      }
    } catch (error) {
      console.error('Error fetching pool entries:', error);
      setPoolEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if user meets rank requirement for ranked pool
  const hasRankRequirement = () => {
    if (poolType === 'ranked' && config.entryRequirements.min_player_rank) {
      const requiredRankOrder = getPlayerRankOrder(config.entryRequirements.min_player_rank);
      const userRankOrder = getPlayerRankOrder(userPlayerRank);
      return userRankOrder >= requiredRankOrder;
    }
    return true; // Casual pool has no rank requirement
  };

  const canEnter = hasRankRequirement() && ticketsRemaining > 0;

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
      const requirement = poolType === 'ranked' && config.entryRequirements.min_player_rank
        ? `${config.entryRequirements.min_player_rank} rank`
        : "requirements";
      toast({
        title: "Cannot Enter Pool",
        description: `You need ${requirement} and at least 1 battle ticket`,
        variant: "destructive"
      });
      return;
    }

    setIsEntering(true);
    try {
      const poolId = poolType === 'casual' ? 1 : 2;
      await enterBattlePool(poolId, selectedHolobot);
      
      // Refresh pool entries to show the new entry
      await fetchPoolEntries();
      
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
    <>
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
            
            {/* Player Rank Requirement for Ranked Pool */}
            {poolType === 'ranked' && config.entryRequirements.min_player_rank && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rank Required</span>
                <div className="flex items-center space-x-2">
                  <PlayerRankBadge rank={config.entryRequirements.min_player_rank as PlayerRank} size="sm" />
                  <span className={cn(
                    "text-xs",
                    hasRankRequirement() ? "text-green-400" : "text-red-400"
                  )}>
                    {hasRankRequirement() ? "✓ Met" : "✗ Not Met"}
                  </span>
                </div>
              </div>
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

          {/* Players in Pool Dashboard */}
          <div className="bg-black/60 rounded-lg p-4 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-cyan-400 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Pool Info
              </h4>
              {poolEntries.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPlayersModal(true)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Players</span>
                </div>
                <span className="text-lg font-bold text-blue-400">{loading ? "..." : poolEntries.length}</span>
              </div>
              <div className="flex items-center justify-between bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Reset</span>
                </div>
                <span className="text-lg font-bold text-green-400">24h</span>
              </div>
            </div>
            
            {/* Recent Players Preview */}
            {poolEntries.length > 0 && (
              <div className="mt-3 space-y-1">
                <span className="text-xs text-gray-400">Recent Entries:</span>
                {poolEntries.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between text-xs bg-gray-800/50 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">{entry.profiles?.username || `User ${entry.user_id.slice(-4)}`}</span>
                    </div>
                    <span className="text-gray-400">{entry.holobot_name}</span>
                  </div>
                ))}
              </div>
            )}

            {poolEntries.length === 0 && !loading && (
              <div className="mt-3 text-center text-xs text-gray-500">
                No players in pool yet. Be the first to enter!
              </div>
            )}
          </div>

          {/* Enhanced Rewards Section */}
          <div className="bg-black/60 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Battle Rewards
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/40">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-200">{config.rewards.boosters}</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">{config.rewards.booster_count}</span>
              </div>
              <div className="flex items-center justify-between bg-purple-500/20 rounded-lg p-3 border border-purple-500/40">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-200">EXP</span>
                </div>
                <span className="text-lg font-bold text-purple-400">{config.rewards.exp}</span>
              </div>
              {config.rewards.rating_points && (
                <>
                  <div className="flex items-center justify-between bg-orange-500/20 rounded-lg p-3 border border-orange-500/40">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                      <span className="text-sm font-medium text-gray-200">Rating</span>
                    </div>
                    <span className="text-lg font-bold text-orange-400">+{config.rewards.rating_points}</span>
                  </div>
                  <div className="flex items-center justify-between bg-cyan-500/20 rounded-lg p-3 border border-cyan-500/40">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-cyan-400" />
                      <span className="text-sm font-medium text-gray-200">Rank</span>
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
              {!hasRankRequirement() && poolType === 'ranked' && `Need ${config.entryRequirements.min_player_rank} rank or higher`}
              {hasRankRequirement() && ticketsRemaining === 0 && "No battle tickets remaining"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Players in Pool Modal */}
      {showPlayersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Players in Pool</CardTitle>
                <CardDescription>
                  {config.name} - {poolEntries.length} active players
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPlayersModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-96 space-y-2">
              {poolEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium text-white">{entry.profiles?.username || `User ${entry.user_id.slice(-4)}`}</div>
                      <div className="text-sm text-gray-400">{entry.holobot_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">
                      {new Date(entry.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {poolEntries.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No players in pool yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
} 