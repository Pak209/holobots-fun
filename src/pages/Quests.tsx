
import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/auth";
import { Trophy, Star, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BLUEPRINT_TIERS } from "@/components/holobots/BlueprintSection";

const Quests = () => {
  const { user } = useAuth();
  
  // Calculate total blueprints collected
  const totalBlueprints = user?.blueprints 
    ? Object.values(user.blueprints).reduce((sum, count) => sum + count, 0)
    : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-holobots-accent to-holobots-hover bg-clip-text text-transparent">
            HOLOBOT QUESTS
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Send your Holobots on adventures to earn rewards and level up
          </p>
          
          {/* XP Info Banner */}
          <div className="mt-4 max-w-md mx-auto p-2 bg-holobots-card/50 rounded-lg border border-holobots-accent/30 flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <p className="text-xs text-holobots-accent">
              All Holobots in your boss battle squad now earn XP!
            </p>
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
          
          {/* Blueprint Info Card */}
          <div className="mt-4 max-w-md mx-auto">
            <Card className="glass-morphism border-holobots-accent/30 bg-black/20">
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-holobots-accent" />
                  Blueprint Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 text-xs">
                <p className="mb-2">Total Blueprints: <span className="text-holobots-accent font-bold">{totalBlueprints}</span></p>
                
                <div className="grid grid-cols-5 gap-1 text-center">
                  {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => (
                    <div 
                      key={key}
                      className={`p-1 rounded text-[10px] border border-holobots-accent/30`}
                    >
                      {tier.name} ({tier.required})
                    </div>
                  ))}
                </div>
                
                <p className="mt-2 text-[10px] text-gray-400">
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
