import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Zap, 
  Coins, 
  Trophy, 
  Users,
  AlertCircle 
} from "lucide-react";
import { UserHolobot } from "@/types/user";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/components/ui/use-toast";
import { useRewardTracking } from "@/hooks/useRewardTracking";

interface BattleLeagueCardProps {
  leagueType: string;
  config: {
    name: string;
    description: string;
    icon: string;
    minSteps: number;
    energyCost: number;
    cpuLevelRange: [number, number];
    rewards: {
      holos: number;
      exp: number;
      parts?: number;
      legendary_parts?: number;
    };
  };
  userSteps: number;
  ticketsRemaining: number;
  userHolobots: UserHolobot[];
}

export const BattleLeagueCard: React.FC<BattleLeagueCardProps> = ({
  leagueType,
  config,
  userSteps,
  ticketsRemaining,
  userHolobots
}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { trackLeagueTierCompletion } = useRewardTracking();

  const canEnter = userSteps >= config.minSteps && ticketsRemaining > 0;
  const hasEnoughSteps = userSteps >= config.minSteps;

  const handleEnterLeague = async () => {
    if (!user || !canEnter) return;

    try {
      // Simulate battle (80% win rate for now)
      const battleWon = Math.random() < 0.8;
      
      // Deduct ticket
      await updateUser({
        async_battle_tickets: (user.async_battle_tickets || 0) - 1
      });

      if (battleWon) {
        // Award rewards
        const updatedUser: any = {
          holosTokens: (user.holosTokens || 0) + config.rewards.holos
        };

        // Track league tier completion for reward system
        trackLeagueTierCompletion(leagueType);

        await updateUser(updatedUser);

        toast({
          title: "League Victory!",
          description: `You won the ${config.name} battle and earned ${config.rewards.holos} Holos!`,
        });
      } else {
        toast({
          title: "Battle Lost",
          description: `You lost the ${config.name} battle. Try again!`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enter league battle",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200",
      canEnter 
        ? "bg-black/40 border-green-500/30 hover:bg-green-900/10" 
        : "bg-black/40 border-gray-500/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{config.icon}</div>
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <p className="text-sm text-gray-400">{config.description}</p>
            </div>
          </div>
          <Badge 
            variant={canEnter ? "default" : "outline"}
            className={cn(
              canEnter 
                ? "bg-green-600 text-white" 
                : "border-gray-500 text-gray-400"
            )}
          >
            {hasEnoughSteps ? "Available" : "Locked"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Requirements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Steps Required:</span>
            <span className={cn(
              hasEnoughSteps ? "text-green-400" : "text-red-400"
            )}>
              {userSteps.toLocaleString()}/{config.minSteps.toLocaleString()}
            </span>
          </div>
          <Progress 
            value={Math.min((userSteps / config.minSteps) * 100, 100)} 
            className="h-2"
          />
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">{config.rewards.holos} Holos</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-400" />
            <span className="text-sm">{config.rewards.exp} EXP</span>
          </div>
          {config.rewards.parts && (
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-purple-400" />
              <span className="text-sm">{config.rewards.parts} Parts</span>
            </div>
          )}
          {config.rewards.legendary_parts && (
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-orange-400" />
              <span className="text-sm">{config.rewards.legendary_parts} Legendary</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleEnterLeague}
          disabled={!canEnter}
          className={cn(
            "w-full",
            canEnter 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          )}
        >
          {!hasEnoughSteps ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Need More Steps
            </>
          ) : ticketsRemaining === 0 ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              No Tickets
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Enter League
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}; 