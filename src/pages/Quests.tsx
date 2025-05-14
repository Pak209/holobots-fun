import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/auth";
import { Trophy, Star } from "lucide-react";
import { QuestInfoPopup } from "@/components/quests/QuestInfoPopup";

const Quests = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 font-orbitron italic">
            HOLOBOT QUESTS
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-2">
            Send your Holobots on adventures to earn rewards and level up
          </p>
          
          {/* XP Info Banner */}
          <div className="flex items-center justify-center mt-2 mb-4">
            <QuestInfoPopup />
          </div>
          
          <div className="mt-3 max-w-md mx-auto p-2 bg-black/40 rounded-lg border border-cyan-500/20 flex items-center justify-center gap-2 mb-6">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <p className="text-xs text-cyan-400">
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
