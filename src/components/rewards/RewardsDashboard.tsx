import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Trophy, 
  Target, 
  Crown,
  Gift,
  Flame
} from "lucide-react";
import { DailyMissionsPanel } from './DailyMissionsPanel';
import { StreakTracker } from './StreakTracker';
import { LeagueProgressTracker } from './LeagueProgressTracker';
import { useRewardStore } from "@/stores/rewardStore";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

interface RewardsDashboardProps {
  className?: string;
}

export const RewardsDashboard: React.FC<RewardsDashboardProps> = ({ 
  className 
}) => {
  const { user } = useAuth();
  
  const {
    dailyMissions,
    trainingStreak,
    arenaStreak,
    leagueProgression,
    initializeRewardSystem,
    getCompletedMissions,
    getUnclaimedRewards,
    getStreakRewards
  } = useRewardStore();

  // Initialize reward system when component mounts
  useEffect(() => {
    if (user?.id) {
      initializeRewardSystem(user.id);
    }
  }, [user?.id, initializeRewardSystem]);

  const completedMissions = getCompletedMissions();
  const unclaimedRewards = getUnclaimedRewards();
  const streakRewards = getStreakRewards();

  return (
    <div className={cn("w-full", className)}>
      <Card className="bg-black/20 border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-cyan-400" />
            <span className="text-cyan-400">Reward Systems Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Daily Missions Summary */}
            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  {completedMissions.length}/{dailyMissions.length}
                </Badge>
              </div>
              <h3 className="font-medium text-white">Daily Missions</h3>
              <p className="text-sm text-gray-400">
                {unclaimedRewards > 0 ? `${unclaimedRewards} unclaimed tickets` : 'All caught up!'}
              </p>
            </div>

            {/* Training Streak Summary */}
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-green-400" />
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  <Flame className="h-3 w-3 mr-1" />
                  {trainingStreak.currentStreak}
                </Badge>
              </div>
              <h3 className="font-medium text-white">Training Streak</h3>
              <p className="text-sm text-gray-400">
                {streakRewards.training > 0 ? `${streakRewards.training} tickets available` : `${trainingStreak.currentStreak} days active`}
              </p>
            </div>

            {/* Arena Streak Summary */}
            <div className="p-4 bg-orange-900/20 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="h-5 w-5 text-orange-400" />
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                  <Flame className="h-3 w-3 mr-1" />
                  {arenaStreak.currentWinStreak}
                </Badge>
              </div>
              <h3 className="font-medium text-white">Arena Streak</h3>
              <p className="text-sm text-gray-400">
                {streakRewards.arena > 0 ? `${streakRewards.arena} tickets available` : `${arenaStreak.currentWinStreak} wins`}
              </p>
            </div>

            {/* League Progress Summary */}
            <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <Crown className="h-5 w-5 text-purple-400" />
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  {leagueProgression.tiersCompleted.length}/4
                </Badge>
              </div>
              <h3 className="font-medium text-white">League Progress</h3>
              <p className="text-sm text-gray-400">
                {leagueProgression.tiersCompleted.length === 4 ? 'All tiers complete!' : `Current: ${leagueProgression.currentTier.replace('_', ' ')}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/20 border border-white/10">
          <TabsTrigger value="missions" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Daily Missions</span>
            {unclaimedRewards > 0 && (
              <Badge className="ml-2 bg-green-600 text-white text-xs">
                {unclaimedRewards}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center space-x-2">
            <Flame className="w-4 h-4" />
            <span>Streaks</span>
            {(streakRewards.training > 0 || streakRewards.arena > 0) && (
              <Badge className="ml-2 bg-orange-600 text-white text-xs">
                {streakRewards.training + streakRewards.arena}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="leagues" className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>League Progress</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>All Rewards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="mt-6">
          <DailyMissionsPanel />
        </TabsContent>

        <TabsContent value="streaks" className="mt-6">
          <StreakTracker />
        </TabsContent>

        <TabsContent value="leagues" className="mt-6">
          <LeagueProgressTracker />
        </TabsContent>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyMissionsPanel />
            <div className="space-y-6">
              <StreakTracker />
              <LeagueProgressTracker />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 