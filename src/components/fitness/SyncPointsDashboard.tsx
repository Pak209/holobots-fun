import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { DEFAULT_SYNC_CONFIG } from "@/types/syncPoints";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useRewardStore } from "@/stores/rewardStore";
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar, 
  Zap,
  RotateCcw,
  Gift
} from "lucide-react";

export function SyncPointsDashboard() {
  const { 
    stats, 
    entries, 
    calculateStats, 
    resetAllData,
    canClaimWeeklyReward,
    canClaimStreakReward,
    claimWeeklyReward,
    claimStreakReward
  } = useSyncPointsStore();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { dailyMissions, claimMissionReward, initializeRewardSystem } = useRewardStore();

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  useEffect(() => {
    if (user?.id) {
      initializeRewardSystem(user.id);
    }
  }, [user?.id, initializeRewardSystem]);

  // Get today's entry
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(entry => entry.date === today);
  const todaySteps = todayEntry?.steps || 0;
  const todayProgress = (todaySteps / DEFAULT_SYNC_CONFIG.dailyStepGoal) * 100;

  // Get weekly progress
  const weeklyProgress = (stats.weeklySteps / DEFAULT_SYNC_CONFIG.weeklyStepGoal) * 100;

  // Get daily fitness mission
  const fitnessSyncMission = dailyMissions.find(mission => mission.type === 'sync_fitness');
  const canClaimDailyReward = fitnessSyncMission?.completed && !fitnessSyncMission?.claimed;

  // Reward claiming handlers
  const handleClaimWeeklyReward = async () => {
    if (!user) return;
    
    const ticketsEarned = claimWeeklyReward();
    if (ticketsEarned > 0) {
      await updateUser({
        gachaTickets: (user.gachaTickets || 0) + ticketsEarned
      });
      
      toast({
        title: "Weekly Reward Claimed!",
        description: `Earned ${ticketsEarned} tickets for a Premium Booster Pack!`,
      });
    }
  };

  const handleClaimStreakReward = async () => {
    if (!user) return;
    
    const ticketsEarned = claimStreakReward();
    if (ticketsEarned > 0) {
      await updateUser({
        gachaTickets: (user.gachaTickets || 0) + ticketsEarned
      });
      
      toast({
        title: "Streak Reward Claimed!",
        description: `Earned ${ticketsEarned} tickets for a Premium Booster Pack!`,
      });
    }
  };

  const handleClaimDailyReward = async () => {
    if (!user || !fitnessSyncMission) return;
    
    try {
      const rewards = await claimMissionReward(fitnessSyncMission.id);
      
      if (rewards.gachaTickets > 0 || rewards.holosTokens > 0) {
        await updateUser({
          gachaTickets: (user.gachaTickets || 0) + rewards.gachaTickets,
          holosTokens: (user.holosTokens || 0) + rewards.holosTokens
        });

        toast({
          title: "Daily Goal Reward Claimed!",
          description: `Earned ${rewards.gachaTickets} Gacha Tickets${rewards.holosTokens > 0 ? ` and ${rewards.holosTokens} Holos` : ''}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim daily reward",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-black/30 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-cyan-300">AVAILABLE SP</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              {stats.availableSyncPoints.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              {stats.totalSyncPoints.toLocaleString()} earned • {stats.totalSpent.toLocaleString()} spent
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 backdrop-blur-md border-yellow-500/30 shadow-[0_0_15px_rgba(255,255,0,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs text-yellow-300">STREAK</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">
              {stats.streak}
            </div>
            <div className="text-xs text-gray-400">
              {stats.streak > 0 ? `${stats.streak} consecutive days` : 'Start your streak!'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card className="bg-black/30 backdrop-blur-md border-green-500/30 shadow-[0_0_15px_rgba(0,255,0,0.15)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Target className="w-5 h-5" />
            TODAY'S PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-300">Steps Today</span>
              <span className="text-white">
                {todaySteps.toLocaleString()} / {DEFAULT_SYNC_CONFIG.dailyStepGoal.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={todayProgress} 
              className="h-2 bg-gray-800"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{Math.round(todayProgress)}% complete</span>
              <span>+{todayEntry?.syncPoints || 0} Sync Points</span>
            </div>
          </div>
          
          {todayProgress >= 100 && (
            <div className="space-y-3">
              <Badge className="bg-green-500 text-white">
                🎉 Daily Goal Achieved!
              </Badge>
              
              {canClaimDailyReward ? (
                <Button
                  onClick={handleClaimDailyReward}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim 10 Tickets (Standard Booster)
                </Button>
              ) : fitnessSyncMission?.completed && fitnessSyncMission?.claimed ? (
                <Badge className="w-full justify-center py-2 bg-gray-600 text-gray-300">
                  Daily Reward Claimed ✓
                </Badge>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-black/30 backdrop-blur-md border-purple-500/30 shadow-[0_0_15px_rgba(128,0,255,0.15)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            WEEKLY PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Steps This Week</span>
              <span className="text-white">
                {stats.weeklySteps.toLocaleString()} / {DEFAULT_SYNC_CONFIG.weeklyStepGoal.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={weeklyProgress} 
              className="h-2 bg-gray-800"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{Math.round(weeklyProgress)}% complete</span>
              <span>+{stats.weeklySyncPoints} Sync Points</span>
            </div>
          </div>
          
          {weeklyProgress >= 100 && (
            <Badge className="bg-purple-500 text-white">
              🏆 Weekly Goal Achieved! (+50% Bonus)
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Reward Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Reward */}
        <Card className="bg-black/30 backdrop-blur-md border-orange-500/30 shadow-[0_0_15px_rgba(255,165,0,0.15)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              WEEKLY REWARD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-orange-300">
              Complete 70,000+ steps in a week
            </div>
            <div className="text-xs text-gray-400">
              Reward: 25 Tickets (Premium Booster Pack)
            </div>
            
            {canClaimWeeklyReward() ? (
              <Button
                onClick={handleClaimWeeklyReward}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Weekly Reward
              </Button>
            ) : weeklyProgress >= 100 ? (
              <Badge className="w-full justify-center py-2 bg-gray-600 text-gray-300">
                Already Claimed This Week
              </Badge>
            ) : (
              <Badge className="w-full justify-center py-2 bg-gray-800 text-gray-400">
                {Math.round(100 - weeklyProgress)}% to go
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Streak Reward */}
        <Card className="bg-black/30 backdrop-blur-md border-pink-500/30 shadow-[0_0_15px_rgba(255,20,147,0.15)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-pink-400 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              STREAK REWARD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-pink-300">
              Maintain a 7+ day streak
            </div>
            <div className="text-xs text-gray-400">
              Reward: 25 Tickets (Premium Booster Pack)
            </div>
            
            {canClaimStreakReward() ? (
              <Button
                onClick={handleClaimStreakReward}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Streak Reward
              </Button>
            ) : stats.streak >= 7 ? (
              <Badge className="w-full justify-center py-2 bg-gray-600 text-gray-300">
                Already Claimed Today
              </Badge>
            ) : (
              <Badge className="w-full justify-center py-2 bg-gray-800 text-gray-400">
                {7 - stats.streak} days to go
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="bg-black/30 backdrop-blur-md border-blue-500/30 shadow-[0_0_15px_rgba(0,100,255,0.15)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            STATISTICS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-300">Daily Average</span>
              <div className="text-white font-bold">
                {stats.dailyAverage.toLocaleString()} steps
              </div>
            </div>
            <div>
              <span className="text-blue-300">Total Days</span>
              <div className="text-white font-bold">
                {entries.length}
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-blue-500/20">
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Steps: {DEFAULT_SYNC_CONFIG.stepsPerSyncPoint} steps = 1 SP</p>
              <p>• Sync Training: {DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute} SP/min (+50% bonus)</p>
              <p>• Streak multiplier: up to ×{Math.max(...DEFAULT_SYNC_CONFIG.bonusMultipliers.streak)}</p>
              <p>• Weekly training: {stats.weeklySyncTrainingMinutes} minutes</p>
              {stats.xHolosWeight > 0 && (
                <p>• xHolos Weight: {stats.xHolosWeight.toFixed(1)} (hidden)</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button (for testing) */}
      <Card className="bg-black/30 backdrop-blur-md border-red-500/30 shadow-[0_0_15px_rgba(255,0,0,0.15)]">
        <CardContent className="p-4">
          <Button
            onClick={resetAllData}
            variant="destructive"
            className="w-full bg-red-500 hover:bg-red-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET ALL DATA (Testing Only)
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            This will clear all sync points, upgrades, and bonds for testing
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 