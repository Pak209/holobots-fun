import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Clock, 
  Eye,
  Award,
  X,
  Sword,
  Users,
  Calendar
} from "lucide-react";
import { AsyncBattle } from "@/types/asyncBattle";
import { cn } from "@/lib/utils";

interface BattleHistoryListProps {
  battles: AsyncBattle[];
}

export function BattleHistoryList({ battles }: BattleHistoryListProps) {
  const [selectedBattle, setSelectedBattle] = useState<AsyncBattle | null>(null);

  const activeBattles = battles.filter(b => 
    b.battle_status === 'pending' || b.battle_status === 'in_progress'
  );
  const completedBattles = battles.filter(b => b.battle_status === 'completed');

  const getBattleTypeIcon = (battleType: string) => {
    return battleType === 'pve_league' ? <Sword className="h-4 w-4" /> : <Users className="h-4 w-4" />;
  };

  const getBattleTypeColor = (battleType: string) => {
    return battleType === 'pve_league' ? 'text-cyan-400' : 'text-purple-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 border-yellow-500';
      case 'in_progress': return 'text-orange-400 border-orange-500';
      case 'completed': return 'text-green-400 border-green-500';
      case 'cancelled': return 'text-red-400 border-red-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const BattleCard = ({ battle }: { battle: AsyncBattle }) => (
    <Card className="bg-black/40 border-gray-700/50 hover:border-gray-600/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={getBattleTypeColor(battle.battle_type)}>
              {getBattleTypeIcon(battle.battle_type)}
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-xs", getBattleTypeColor(battle.battle_type))}
            >
              {battle.battle_type === 'pve_league' ? 'PvE League' : 'PvP Pool'}
            </Badge>
          </div>
          <Badge variant="outline" className={cn("text-xs", getStatusColor(battle.battle_status))}>
            {battle.battle_status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{battle.player1_holobot.name}</span>
            <span className="text-gray-400 text-sm">vs</span>
            <span className="font-medium">{battle.player2_holobot.name}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(battle.created_at)}</span>
            </div>
            {battle.battle_status === 'completed' && battle.winner_id && (
              <div className="flex items-center space-x-1">
                <Trophy className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-400">
                  {battle.winner_id === battle.player1_id ? battle.player1_holobot.name : battle.player2_holobot.name} Won
                </span>
              </div>
            )}
          </div>

          {battle.battle_status === 'completed' && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
              <div className="text-xs text-gray-400">
                Rewards: {battle.rewards.holos || 0} Holos, {battle.rewards.exp || 0} EXP
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSelectedBattle(battle)}
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Replay
              </Button>
            </div>
          )}

          {battle.battle_status === 'pending' && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
              <div className="text-xs text-yellow-400">
                <Clock className="h-3 w-3 inline mr-1" />
                Waiting for battle simulation...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (battles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-300 mb-2">No Battles Yet</h3>
        <p className="text-gray-400 text-sm">
          Enter a league or battle pool to start your first async battle!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-gray-700/50">
          <TabsTrigger value="active" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
            Active ({activeBattles.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Completed ({completedBattles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBattles.length > 0 ? (
            activeBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No active battles</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedBattles.length > 0 ? (
            completedBattles.map((battle) => (
              <BattleCard key={battle.id} battle={battle} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No completed battles</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Battle Replay Modal */}
      {selectedBattle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Battle Replay</CardTitle>
                <CardDescription>
                  {selectedBattle.player1_holobot.name} vs {selectedBattle.player2_holobot.name}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedBattle(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-96">
              {selectedBattle.battle_log.length > 0 ? (
                <div className="space-y-2">
                  {selectedBattle.battle_log.map((logEntry, index) => (
                    <div 
                      key={index} 
                      className="p-2 bg-black/40 rounded border border-gray-700/50 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Round {logEntry.round}</span>
                        <Badge variant="outline" className="text-xs">
                          {logEntry.action}
                        </Badge>
                      </div>
                      <p className="text-gray-200">{logEntry.message}</p>
                      {logEntry.damage && logEntry.damage > 0 && (
                        <p className="text-xs text-red-400 mt-1">
                          Damage: {logEntry.damage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No battle log available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 