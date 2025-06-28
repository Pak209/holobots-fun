import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown,
  Ticket,
  Coins,
  CheckCircle,
  Trophy
} from "lucide-react";
import { useRewardStore } from "@/stores/rewardStore";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { LEAGUE_TIER_REWARDS } from "@/types/rewards";

interface LeagueProgressTrackerProps {
  className?: string;
}

export const LeagueProgressTracker: React.FC<LeagueProgressTrackerProps> = ({ 
  className 
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const {
    leagueProgression,
    updateLeagueProgression
  } = useRewardStore();

  const tiers = ['junkyard', 'city_scraps', 'neon_core', 'overlord'] as const;

  const handleClaimTierReward = async (tier: string) => {
    if (!user || leagueProgression.tiersCompleted.includes(tier)) return;

    try {
      const reward = LEAGUE_TIER_REWARDS[tier as keyof typeof LEAGUE_TIER_REWARDS];
      
      await updateUser({
        gachaTickets: (user.gachaTickets || 0) + reward.gachaTickets,
        holosTokens: (user.holosTokens || 0) + reward.holosTokens
      });

      updateLeagueProgression(tier);

      toast({
        title: "League Tier Completed!",
        description: `Earned ${reward.gachaTickets} Gacha Tickets and ${reward.holosTokens} Holos!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim league tier reward",
        variant: "destructive"
      });
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'junkyard': return 'Junkyard League';
      case 'city_scraps': return 'City Scraps League';
      case 'neon_core': return 'Neon Core League';
      case 'overlord': return 'Overlord League';
      default: return tier;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'junkyard': return '🔧';
      case 'city_scraps': return '🏙️';
      case 'neon_core': return '💎';
      case 'overlord': return '👑';
      default: return '⚡';
    }
  };

  return (
    <Card className={cn("bg-black/20 border-white/10", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-400" />
            <span className="text-purple-400">League Victories</span>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
            {leagueProgression.tiersCompleted.length}/{tiers.length} Tiers
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tiers.map((tier, index) => {
            const isCompleted = leagueProgression.tiersCompleted.includes(tier);
            const isCurrent = leagueProgression.currentTier === tier;
            const reward = LEAGUE_TIER_REWARDS[tier];
            
            return (
              <div
                key={tier}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200",
                  isCompleted 
                    ? "bg-green-900/20 border-green-500/30"
                    : isCurrent
                    ? "bg-purple-900/20 border-purple-500/30"
                    : "bg-gray-900/20 border-gray-500/30"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                      isCompleted 
                        ? "bg-green-500/20" 
                        : isCurrent
                        ? "bg-purple-500/20"
                        : "bg-gray-500/20"
                    )}>
                      {getTierIcon(tier)}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{getTierName(tier)}</h4>
                      <p className="text-sm text-gray-400">Tier {index + 1}</p>
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : isCurrent ? (
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      Current
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-500 text-gray-400">
                      Locked
                    </Badge>
                  )}
                </div>

                {/* Rewards */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Ticket className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        {reward.gachaTickets} Tickets
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">
                        {reward.holosTokens} Holos
                      </span>
                    </div>
                  </div>
                  
                  {isCurrent && !isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => handleClaimTierReward(tier)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Trophy className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {leagueProgression.tiersCompleted.length === tiers.length && (
            <div className="text-center py-6">
              <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-yellow-400 mb-2">
                Champion Status!
              </h3>
              <p className="text-gray-400">
                You've conquered all league tiers. Incredible work!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 