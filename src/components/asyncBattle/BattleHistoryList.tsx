import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Clock, 
  Eye,
  Award,
  X,
  Sword,
  Users,
  Calendar,
  Star,
  Coins,
  RefreshCw,
  Bot
} from "lucide-react";
import { AsyncBattle } from "@/types/asyncBattle";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface BattleEntry {
  id: number;
  battle_type: 'pool_entry' | 'pve_league';
  created_at: string;
  status: 'pending' | 'in_progress' | 'completed';
  holobot_name: string;
  opponent_name: string;
  rewards?: {
    holos?: number;
    exp?: number;
    rating_points?: number;
  };
  pool_type?: string;
  league_name?: string;
}

export function BattleHistoryList() {
  const [battles, setBattles] = useState<BattleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBattleHistory();
    }
  }, [user]);

  const fetchBattleHistory = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setBattles([]);
        return;
      }

      // Fetch pool entries
      const { data: poolData, error: poolError } = await supabase
        .from('battle_pool_entries' as any)
        .select('id, pool_id, holobot_name, submitted_at, holobot_stats')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('submitted_at', { ascending: false })
        .limit(25);

      // Fetch league battles
      const { data: battleData, error: battleError } = await supabase
        .from('async_battles' as any)
        .select('id, battle_type, league_id, player1_holobot, player2_holobot, battle_status, rewards, created_at')
        .eq('player1_id', user.id)
        .order('created_at', { ascending: false })
        .limit(25);

      if (poolError) {
        console.error('Error fetching pool entries:', poolError);
      }
      
      if (battleError) {
        console.error('Error fetching battle history:', battleError);
      }

      // Format and combine all battles
      const allBattles: BattleEntry[] = [];

      // Add pool entries
      if (poolData) {
        const poolEntries = ((poolData as any) || []).map((entry: any) => {
          const poolType = entry.pool_id === 1 ? 'casual' : 'ranked';
          return {
            id: entry.id,
            battle_type: 'pool_entry' as const,
            created_at: entry.submitted_at || new Date().toISOString(),
            status: 'pending' as const,
            holobot_name: entry.holobot_name || 'Unknown',
            opponent_name: 'Matchmaking in progress...',
            pool_type: poolType,
            rewards: {
              holos: poolType === 'ranked' ? 100 : 50,
              exp: poolType === 'ranked' ? 200 : 100,
              rating_points: poolType === 'ranked' ? 25 : undefined
            }
          };
        });
        allBattles.push(...poolEntries);
      }

      // Add league battles
      if (battleData) {
        const leagueBattles = ((battleData as any) || []).map((battle: any) => {
          const status = battle.battle_status || 'pending';
          return {
            id: battle.id,
            battle_type: 'pve_league' as const,
            created_at: battle.created_at || new Date().toISOString(),
            status: status as 'pending' | 'in_progress' | 'completed',
            holobot_name: battle.player1_holobot?.name || 'Unknown',
            opponent_name: battle.player2_holobot?.name || 'AI Opponent',
            league_name: getLeagueName(battle.league_id || 1),
            rewards: {
              holos: battle.rewards?.holos || 50,
              exp: battle.rewards?.exp || 100
            }
          };
        });
        allBattles.push(...leagueBattles);
      }

      // Sort all battles by creation date
      allBattles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('Fetched user battles:', allBattles);
      setBattles(allBattles);
    } catch (error) {
      console.error('Error fetching battle history:', error);
      setBattles([]);
    } finally {
      setLoading(false);
    }
  };

  const getLeagueName = (leagueId: number) => {
    const leagues = {
      1: 'Junkyard League',
      2: 'City Scraps League', 
      3: 'Neon Core League',
      4: 'Overlord League'
    };
    return leagues[leagueId as keyof typeof leagues] || 'Unknown League';
  };

  const getBattleTypeIcon = (battleType: string) => {
    switch (battleType) {
      case 'pool_entry':
        return <Users className="h-4 w-4" />;
      case 'pve_league':
        return <Bot className="h-4 w-4" />;
      default:
        return <Sword className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-cyan-400 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Battle History
          </CardTitle>
          <CardDescription>Loading your recent battles...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-cyan-400 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Battle History
        </CardTitle>
        <CardDescription>
          Your recent battle entries and results ({battles.length} total)
          <br />
          <span className="text-xs text-cyan-400">
            Pool entries show "Matchmaking" while waiting for opponents
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {battles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Battle History</p>
              <p className="text-sm">Enter a battle pool or league to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {battles.map((battle) => (
                <div 
                  key={battle.id}
                  className="p-4 border border-gray-700/50 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getBattleTypeIcon(battle.battle_type)}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          battle.battle_type === 'pool_entry' ? "border-blue-500 text-blue-400" : "border-purple-500 text-purple-400"
                        )}
                      >
                        {battle.battle_type === 'pool_entry' ? 
                          `${battle.pool_type?.toUpperCase()} POOL` : 
                          battle.league_name?.toUpperCase()
                        }
                      </Badge>
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(battle.status))} />
                      <span className="text-xs text-gray-400 capitalize">
                        {battle.status === 'pending' && battle.battle_type === 'pool_entry' 
                          ? 'Matchmaking' 
                          : battle.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(battle.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium text-white text-sm">{battle.holobot_name}</div>
                        <div className="text-xs text-gray-400">vs {battle.opponent_name}</div>
                      </div>
                    </div>
                    
                    {battle.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span className="text-xs text-yellow-400">Victory</span>
                      </div>
                    )}
                  </div>

                  {/* Rewards Section */}
                  {battle.rewards && (
                    <div className="grid grid-cols-3 gap-2">
                      {battle.rewards.holos && (
                        <div className="flex items-center justify-between bg-yellow-500/10 rounded px-2 py-1 border border-yellow-500/20">
                          <Coins className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs font-medium text-yellow-400">
                            +{battle.rewards.holos}
                          </span>
                        </div>
                      )}
                      {battle.rewards.exp && (
                        <div className="flex items-center justify-between bg-purple-500/10 rounded px-2 py-1 border border-purple-500/20">
                          <Star className="h-3 w-3 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">
                            +{battle.rewards.exp}
                          </span>
                        </div>
                      )}
                      {battle.rewards.rating_points && (
                        <div className="flex items-center justify-between bg-orange-500/10 rounded px-2 py-1 border border-orange-500/20">
                          <Trophy className="h-3 w-3 text-orange-400" />
                          <span className="text-xs font-medium text-orange-400">
                            +{battle.rewards.rating_points}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 