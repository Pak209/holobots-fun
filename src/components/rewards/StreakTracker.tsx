import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Flame,
  Trophy,
  Ticket,
  Calendar,
  Zap
} from "lucide-react";
import { useRewardStore } from "@/stores/rewardStore";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { TRAINING_STREAK_REWARDS, ARENA_STREAK_REWARDS } from "@/types/rewards";

interface StreakTrackerProps {
  className?: string;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ 
  className 
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const {
    trainingStreak,
    arenaStreak,
    getStreakRewards,
    canClaimWeeklyTrainingReward,
    getNextArenaStreakReward
  } = useRewardStore();

  const streakRewards = getStreakRewards();
  const canClaimTrainingReward = canClaimWeeklyTrainingReward();
  const nextArenaReward = getNextArenaStreakReward();

  const handleClaimTrainingReward = async () => {
    if (!user || !canClaimTrainingReward) return;

    try {
      const rewardTickets = TRAINING_STREAK_REWARDS.WEEKLY_TICKETS;
      
      await updateUser({
        gachaTickets: (user.gachaTickets || 0) + rewardTickets
      });

      toast({
        title: "Training Streak Reward!",
        description: `Earned ${rewardTickets} Gacha Tickets for your 7-day training streak!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim training streak reward",
        variant: "destructive"
      });
    }
  };

  const handleClaimArenaReward = async () => {
    if (!user || streakRewards.arena === 0) return;

    try {
      await updateUser({
        gachaTickets: (user.gachaTickets || 0) + streakRewards.arena
      });

      toast({
        title: "Arena Streak Reward!",
        description: `Earned ${streakRewards.arena} Gacha Tickets for your win streak!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim arena streak reward",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Training Streak */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-400" />
              <span className="text-green-400">Sync Training Streak</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                <Flame className="h-3 w-3 mr-1" />
                {trainingStreak.currentStreak} days
              </Badge>
              {canClaimTrainingReward && (
                <Badge variant="default" className="bg-green-600 text-white">
                  {TRAINING_STREAK_REWARDS.WEEKLY_TICKETS} Tickets
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {trainingStreak.currentStreak}
                </div>
                <div className="text-xs text-gray-400">Current Streak</div>
              </div>
              <div className="text-center p-3 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {trainingStreak.longestStreak}
                </div>
                <div className="text-xs text-gray-400">Best Streak</div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Weekly Progress</span>
                <span className="text-gray-400">
                  {Math.min(trainingStreak.currentStreak % 7, 7)}/7 days
                </span>
              </div>
              <Progress 
                value={(Math.min(trainingStreak.currentStreak % 7, 7) / 7) * 100} 
                className="h-2"
              />
            </div>

            {/* Rewards */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
              <div className="flex items-center space-x-1">
                <Ticket className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">
                  {TRAINING_STREAK_REWARDS.WEEKLY_TICKETS} Tickets/week
                </span>
              </div>
              
              {canClaimTrainingReward && (
                <Button
                  size="sm"
                  onClick={handleClaimTrainingReward}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Claim Weekly
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arena Streak */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-orange-400" />
              <span className="text-orange-400">Arena Win Streak</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                <Flame className="h-3 w-3 mr-1" />
                {arenaStreak.currentWinStreak} wins
              </Badge>
              {streakRewards.arena > 0 && (
                <Badge variant="default" className="bg-orange-600 text-white">
                  {streakRewards.arena} Tickets
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">
                  {arenaStreak.currentWinStreak}
                </div>
                <div className="text-xs text-gray-400">Current Streak</div>
              </div>
              <div className="text-center p-3 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">
                  {arenaStreak.longestWinStreak}
                </div>
                <div className="text-xs text-gray-400">Best Streak</div>
              </div>
            </div>

            {/* Next Milestone */}
            {nextArenaReward > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Next Milestone</span>
                  <span className="text-gray-400">
                    {arenaStreak.currentWinStreak}/{nextArenaReward} wins
                  </span>
                </div>
                <Progress 
                  value={(arenaStreak.currentWinStreak / nextArenaReward) * 100} 
                  className="h-2"
                />
              </div>
            )}

            {/* Milestones */}
            <div className="space-y-2">
              <div className="text-sm text-gray-400 mb-2">Streak Milestones:</div>
              <div className="grid grid-cols-2 gap-2">
                {ARENA_STREAK_REWARDS.STREAK_THRESHOLDS.map((threshold, index) => (
                  <div
                    key={threshold}
                    className={cn(
                      "p-2 rounded border text-center text-xs",
                      arenaStreak.currentWinStreak >= threshold
                        ? "border-orange-500/30 bg-orange-900/20 text-orange-400"
                        : "border-gray-500/30 bg-gray-900/20 text-gray-400"
                    )}
                  >
                    {threshold} wins = {ARENA_STREAK_REWARDS.TICKETS_PER_THRESHOLD[index]} tickets
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Button */}
            {streakRewards.arena > 0 && (
              <div className="pt-3 border-t border-gray-700/50">
                <Button
                  size="sm"
                  onClick={handleClaimArenaReward}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Claim {streakRewards.arena} Tickets
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 