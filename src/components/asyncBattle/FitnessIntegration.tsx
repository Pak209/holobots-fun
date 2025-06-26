import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Zap, Shield, Target, TrendingUp } from "lucide-react";
import { FitnessActivity, FITNESS_BONUS_THRESHOLDS } from "@/types/asyncBattle";
import { cn } from "@/lib/utils";

interface FitnessIntegrationProps {
  fitnessActivity: FitnessActivity;
  todaysSteps: number;
}

export const FitnessIntegration: React.FC<FitnessIntegrationProps> = ({
  fitnessActivity,
  todaysSteps,
}) => {
  // Calculate bonus levels based on steps
  const getBonusLevel = (steps: number) => {
    if (steps >= FITNESS_BONUS_THRESHOLDS.ALL_STATS) return 'ultimate';
    if (steps >= FITNESS_BONUS_THRESHOLDS.SPECIAL_BONUS) return 'high';
    if (steps >= FITNESS_BONUS_THRESHOLDS.ATTACK_BONUS) return 'medium';
    if (steps >= FITNESS_BONUS_THRESHOLDS.HP_BONUS) return 'low';
    return 'none';
  };

  const bonusLevel = getBonusLevel(todaysSteps);

  const bonusDetails = [
    {
      threshold: FITNESS_BONUS_THRESHOLDS.HP_BONUS,
      label: 'HP Bonus',
      value: '+5%',
      icon: Heart,
      color: 'text-red-400',
      achieved: todaysSteps >= FITNESS_BONUS_THRESHOLDS.HP_BONUS
    },
    {
      threshold: FITNESS_BONUS_THRESHOLDS.ATTACK_BONUS,
      label: 'Attack Bonus',
      value: '+3%',
      icon: Target,
      color: 'text-orange-400',
      achieved: todaysSteps >= FITNESS_BONUS_THRESHOLDS.ATTACK_BONUS
    },
    {
      threshold: FITNESS_BONUS_THRESHOLDS.SPECIAL_BONUS,
      label: 'Special Charge',
      value: '+10%',
      icon: Zap,
      color: 'text-yellow-400',
      achieved: todaysSteps >= FITNESS_BONUS_THRESHOLDS.SPECIAL_BONUS
    },
    {
      threshold: FITNESS_BONUS_THRESHOLDS.ALL_STATS,
      label: 'All Stats Bonus',
      value: '+5%',
      icon: Shield,
      color: 'text-purple-400',
      achieved: todaysSteps >= FITNESS_BONUS_THRESHOLDS.ALL_STATS
    }
  ];

  const maxSteps = Math.max(FITNESS_BONUS_THRESHOLDS.ALL_STATS, todaysSteps);
  const progressPercentage = Math.min((todaysSteps / FITNESS_BONUS_THRESHOLDS.ALL_STATS) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Daily Steps Overview */}
      <Card className="bg-black/40 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-green-400 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Daily Steps Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{todaysSteps.toLocaleString()} steps</span>
              <Badge 
                variant="outline" 
                className={cn(
                  bonusLevel === 'ultimate' && "border-purple-500 text-purple-400",
                  bonusLevel === 'high' && "border-yellow-500 text-yellow-400",
                  bonusLevel === 'medium' && "border-orange-500 text-orange-400",
                  bonusLevel === 'low' && "border-red-500 text-red-400",
                  bonusLevel === 'none' && "border-gray-500 text-gray-400"
                )}
              >
                {bonusLevel === 'ultimate' && 'Ultimate Warrior'}
                {bonusLevel === 'high' && 'Battle Master'}
                {bonusLevel === 'medium' && 'Fighter'}
                {bonusLevel === 'low' && 'Rookie'}
                {bonusLevel === 'none' && 'No Bonus'}
              </Badge>
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="flex justify-between text-sm text-gray-400">
              <span>0 steps</span>
              <span>{FITNESS_BONUS_THRESHOLDS.ALL_STATS.toLocaleString()} steps (max)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Bonuses */}
      <Card className="bg-black/40 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Battle Bonuses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bonusDetails.map((bonus, index) => {
              const IconComponent = bonus.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200",
                    bonus.achieved 
                      ? "bg-green-900/20 border-green-500/30" 
                      : "bg-gray-900/20 border-gray-500/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <IconComponent className={cn("h-5 w-5 mr-2", bonus.color)} />
                      <span className="font-medium">{bonus.label}</span>
                    </div>
                    <Badge 
                      variant={bonus.achieved ? "default" : "outline"}
                      className={cn(
                        bonus.achieved && "bg-green-600 text-white",
                        !bonus.achieved && "border-gray-500 text-gray-400"
                      )}
                    >
                      {bonus.value}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">
                    Requires {bonus.threshold.toLocaleString()} steps
                  </div>
                  <Progress 
                    value={Math.min((todaysSteps / bonus.threshold) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fitness Activity History */}
      <Card className="bg-black/40 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-black/40 rounded-lg">
                <div className="text-lg font-bold text-blue-400">
                  {fitnessActivity.steps?.toLocaleString() || '0'}
                </div>
                <div className="text-xs text-gray-400">Daily Steps</div>
              </div>
              <div className="p-3 bg-black/40 rounded-lg">
                <div className="text-lg font-bold text-green-400">
                  {Math.round((fitnessActivity.workout_time || 0) / 60)}
                </div>
                <div className="text-xs text-gray-400">Workout Min</div>
              </div>
              <div className="p-3 bg-black/40 rounded-lg">
                <div className="text-lg font-bold text-purple-400">
                  {fitnessActivity.calories_burned || 0}
                </div>
                <div className="text-xs text-gray-400">Calories</div>
              </div>
            </div>

            {fitnessActivity.updated_at && (
              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Last updated: {new Date(fitnessActivity.updated_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* League Access Requirements */}
      <Card className="bg-black/40 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            League Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-gray-400 mb-4">
              Your daily steps determine which leagues you can access:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={cn(
                "p-3 rounded-lg border",
                todaysSteps >= 2000 ? "border-green-500/30 bg-green-900/20" : "border-gray-500/30 bg-gray-900/20"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Junkyard League</span>
                  <Badge variant={todaysSteps >= 2000 ? "default" : "outline"}>
                    2,000+ steps
                  </Badge>
                </div>
              </div>
              
              <div className={cn(
                "p-3 rounded-lg border",
                todaysSteps >= 4000 ? "border-green-500/30 bg-green-900/20" : "border-gray-500/30 bg-gray-900/20"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">City Scraps</span>
                  <Badge variant={todaysSteps >= 4000 ? "default" : "outline"}>
                    4,000+ steps
                  </Badge>
                </div>
              </div>
              
              <div className={cn(
                "p-3 rounded-lg border",
                todaysSteps >= 6000 ? "border-green-500/30 bg-green-900/20" : "border-gray-500/30 bg-gray-900/20"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Neon Core</span>
                  <Badge variant={todaysSteps >= 6000 ? "default" : "outline"}>
                    6,000+ steps
                  </Badge>
                </div>
              </div>
              
              <div className={cn(
                "p-3 rounded-lg border",
                todaysSteps >= 8000 ? "border-green-500/30 bg-green-900/20" : "border-gray-500/30 bg-gray-900/20"
              )}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overlord</span>
                  <Badge variant={todaysSteps >= 8000 ? "default" : "outline"}>
                    8,000+ steps
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 