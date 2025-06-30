import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { DEFAULT_SYNC_CONFIG } from "@/types/syncPoints";
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar, 
  Zap,
  RotateCcw
} from "lucide-react";

export function SyncPointsDashboard() {
  const { stats, entries, calculateStats, resetDailyEntries } = useSyncPointsStore();

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Get today's entry
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(entry => entry.date === today);
  const todaySteps = todayEntry?.steps || 0;
  const todayProgress = (todaySteps / DEFAULT_SYNC_CONFIG.dailyStepGoal) * 100;

  // Get weekly progress
  const weeklyProgress = (stats.weeklySteps / DEFAULT_SYNC_CONFIG.weeklyStepGoal) * 100;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-black/30 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-xs text-cyan-300">TOTAL SYNC POINTS</span>
            </div>
            <div className="text-2xl font-bold text-cyan-400">
              {stats.totalSyncPoints.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              From {stats.totalSteps.toLocaleString()} steps
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
            <Badge className="bg-green-500 text-white">
              🎉 Daily Goal Achieved!
            </Badge>
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
              <p>• Sync Points rate: {DEFAULT_SYNC_CONFIG.stepsPerSyncPoint} steps = 1 point</p>
              <p>• Streak multiplier: up to ×{Math.max(...DEFAULT_SYNC_CONFIG.bonusMultipliers.streak)}</p>
              <p>• Weekly goal bonus: +{(DEFAULT_SYNC_CONFIG.bonusMultipliers.weeklyGoal - 1) * 100}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Button (for testing) */}
      <Card className="bg-black/30 backdrop-blur-md border-red-500/30 shadow-[0_0_15px_rgba(255,0,0,0.15)]">
        <CardContent className="p-4">
          <Button
            onClick={resetDailyEntries}
            variant="destructive"
            className="w-full bg-red-500 hover:bg-red-600"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET ALL DATA (Testing Only)
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            This will clear all sync points data for testing purposes
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 