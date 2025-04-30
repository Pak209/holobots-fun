
import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/auth";
import { Trophy, Star, FileText, Battery, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BLUEPRINT_TIERS } from "@/components/holobots/BlueprintSection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { PlayerRankCard } from "@/components/PlayerRankCard";

const Quests = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  // Calculate total blueprints collected
  const totalBlueprints = user?.blueprints 
    ? Object.values(user.blueprints).reduce((sum, count) => sum + count, 0)
    : 0;
  
  // Handle energy refill
  const handleEnergyRefill = async () => {
    if (!user) return;
    
    if (user.energy_refills && user.energy_refills > 0) {
      try {
        await updateUser({
          dailyEnergy: user.maxDailyEnergy,
          energy_refills: user.energy_refills - 1
        });
        
        toast({
          title: "Energy Refilled!",
          description: `Your energy has been refilled to maximum.`,
          variant: "default"
        });
      } catch (error) {
        console.error("Error refilling energy:", error);
        toast({
          title: "Error",
          description: "Failed to refill energy. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "No Energy Refills",
        description: "You don't have any energy refill items.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-app-background">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold neon-text-cyan">
            HOLOBOT QUESTS
          </h1>
          <p className="text-app-textSecondary text-sm max-w-md mx-auto">
            Send your Holobots on adventures to earn rewards and level up
          </p>
          
          {/* XP Info Banner */}
          <div className="mt-4 max-w-md mx-auto p-2 bg-app-backgroundLight rounded-lg border border-app-primary/30 flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <p className="text-xs text-app-primary">
              All Holobots in your boss battle squad now earn XP!
            </p>
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
          
          {/* Player Rank Card */}
          {user && (
            <div className="mt-4 max-w-md mx-auto">
              <PlayerRankCard
                playerRank={(user.rank as keyof typeof playerRankColors) || "Rookie"}
                holobots={user.holobots || []}
                prestigeCount={user.prestige_count || 0}
              />
            </div>
          )}
          
          {/* Energy Display */}
          <div className="mt-4 max-w-md mx-auto">
            <Card className="glass-morphism border-app-primary/30 bg-black/20">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Battery className="h-4 w-4 text-app-primary" />
                  Daily Energy
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-app-primary font-medium">Energy</span>
                  <span className="text-white">{user?.dailyEnergy || 0}/{user?.maxDailyEnergy || 100}</span>
                </div>
                <Progress 
                  value={(user?.dailyEnergy || 0) / (user?.maxDailyEnergy || 100) * 100} 
                  className="h-2 bg-gray-700"
                />
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-app-textSecondary">
                    Available Refills: <span className="text-app-primary">{user?.energy_refills || 0}</span>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-app-primary hover:bg-app-primary/80 text-black"
                    disabled={!user?.energy_refills || user?.energy_refills <= 0 || user?.dailyEnergy >= user?.maxDailyEnergy}
                    onClick={handleEnergyRefill}
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    Refill Energy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Blueprint Info Card */}
          <div className="mt-4 max-w-md mx-auto">
            <Card className="glass-morphism border-app-primary/30 bg-black/20">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-app-primary" />
                  Blueprint Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 text-xs">
                <p className="mb-2">Total Blueprints: <span className="text-app-primary font-bold">{totalBlueprints}</span></p>
                
                <div className="grid grid-cols-5 gap-1 text-center">
                  {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => (
                    <div 
                      key={key}
                      className={`p-1 rounded text-[10px] border border-app-primary/30`}
                    >
                      {tier.name} ({tier.required})
                    </div>
                  ))}
                </div>
                
                <p className="mt-2 text-[10px] text-app-textSecondary">
                  Collect blueprints from Quests to mint new Holobots!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <QuestGrid />
      </div>
    </div>
  );
};

export default Quests;
