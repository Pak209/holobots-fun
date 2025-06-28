import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Target, 
  CheckCircle, 
  Gift, 
  Ticket,
  Coins,
  Star
} from "lucide-react";
import { useRewardStore } from "@/stores/rewardStore";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useRewardTracking } from "@/hooks/useRewardTracking";
import { cn } from "@/lib/utils";

interface DailyMissionsPanelProps {
  className?: string;
}

export const DailyMissionsPanel: React.FC<DailyMissionsPanelProps> = ({ 
  className 
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { trackDailyLogin } = useRewardTracking();
  
  const {
    dailyMissions,
    initializeRewardSystem,
    claimMissionReward,
    getCompletedMissions,
    getUnclaimedRewards
  } = useRewardStore();

  // Initialize reward system when component mounts
  useEffect(() => {
    if (user?.id) {
      initializeRewardSystem(user.id);
    }
  }, [user?.id, initializeRewardSystem]);

  // Track daily login when component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      trackDailyLogin();
    }
  }, [user?.id, trackDailyLogin]);

  const handleClaimReward = async (missionId: string) => {
    if (!user) return;

    try {
      const rewards = await claimMissionReward(missionId);
      
      if (rewards.gachaTickets > 0 || rewards.holosTokens > 0) {
        await updateUser({
          gachaTickets: (user.gachaTickets || 0) + rewards.gachaTickets,
          holosTokens: (user.holosTokens || 0) + rewards.holosTokens
        });

        toast({
          title: "Mission Reward Claimed!",
          description: `Earned ${rewards.gachaTickets} Gacha Tickets${rewards.holosTokens > 0 ? ` and ${rewards.holosTokens} Holos` : ''}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim mission reward",
        variant: "destructive"
      });
    }
  };

  const getMissionIcon = (missionType: string) => {
    switch (missionType) {
      case 'daily_login': return <Calendar className="h-4 w-4" />;
      case 'complete_quest': return <Target className="h-4 w-4" />;
      case 'train_holobot': return <Star className="h-4 w-4" />;
      case 'arena_battle': return <CheckCircle className="h-4 w-4" />;
      case 'open_booster_pack': return <Gift className="h-4 w-4" />;
      case 'sync_fitness': return <Target className="h-4 w-4" />;
      case 'level_up_holobot': return <Star className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const completedMissions = getCompletedMissions();
  const unclaimedRewards = getUnclaimedRewards();

  return (
    <Card className={cn("bg-black/20 border-white/10", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400">Daily Missions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {completedMissions.length}/{dailyMissions.length}
            </Badge>
            {unclaimedRewards > 0 && (
              <Badge variant="default" className="bg-green-600 text-white">
                {unclaimedRewards} Tickets
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dailyMissions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Daily missions will refresh soon...</p>
            </div>
          ) : (
            dailyMissions.map((mission) => (
              <div
                key={mission.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200",
                  mission.completed
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-gray-900/20 border-gray-500/30"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      mission.completed 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-gray-500/20 text-gray-400"
                    )}>
                      {getMissionIcon(mission.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{mission.name}</h4>
                      <p className="text-sm text-gray-400">{mission.description}</p>
                    </div>
                  </div>
                  
                  {/* Claim Button States */}
                  {mission.completed && !mission.claimed && (
                    <Button
                      size="sm"
                      onClick={() => handleClaimReward(mission.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Claim
                    </Button>
                  )}
                  
                  {mission.claimed && (
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Claimed
                    </Badge>
                  )}
                  
                  {!mission.completed && !mission.claimed && (
                    <Button
                      size="sm"
                      disabled
                      className="bg-gray-600/30 text-gray-500 cursor-not-allowed border border-gray-600/50"
                      aria-label="Complete mission to claim reward"
                    >
                      <Gift className="h-4 w-4 mr-1 opacity-50" />
                      Claim
                    </Button>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Progress: {mission.progress}/{mission.target}
                    </span>
                    <span className="text-gray-400">
                      {Math.round((mission.progress / mission.target) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(mission.progress / mission.target) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Ticket className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        {mission.reward.gachaTickets} Tickets
                      </span>
                    </div>
                    {mission.reward.holosTokens && (
                      <div className="flex items-center space-x-1">
                        <Coins className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400">
                          {mission.reward.holosTokens} Holos
                        </span>
                      </div>
                    )}
                    {mission.reward.exp && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-purple-400">
                          {mission.reward.exp} EXP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 