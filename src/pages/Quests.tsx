
import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Star } from "lucide-react";

const Quests = () => {
  const { user } = useAuth();
  
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
        </div>
        
        <QuestGrid />
      </div>
    </div>
  );
};

export default Quests;
