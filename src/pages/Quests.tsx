import { QuestGrid } from "@/components/QuestGrid";
import { useAuth } from "@/contexts/auth";
import { Trophy, Star } from "lucide-react";
import { QuestInfoPopup } from "@/components/quests/QuestInfoPopup";

const Quests = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-8">
          {/* Header */}
          <div className="relative mb-6 inline-block">
            <div className="bg-gradient-to-r from-[#F5C400] via-[#F5C400] to-transparent p-4 pr-20 border-4 border-[#F5C400] shadow-[0_0_30px_rgba(245,196,0,0.6)]" style={{
              clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 0 100%)'
            }}>
              <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-widest">HOLOBOT QUESTS</h1>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-4 uppercase tracking-wide">
            Send your Holobots on adventures to earn rewards and level up
          </p>
          
          {/* XP Info Banner */}
          <div className="flex items-center justify-center mt-4 mb-4">
            <QuestInfoPopup />
          </div>
          
          {/* Bonus XP Banner */}
          <div className="mt-4 max-w-md mx-auto bg-gradient-to-r from-gray-900 via-black to-gray-900 border-3 border-[#F5C400] p-3 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,196,0,0.4)]" style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}>
            <Trophy className="h-5 w-5 text-[#F5C400]" />
            <p className="text-sm text-white font-bold uppercase tracking-wide">
              All Holobots in your boss battle squad now earn XP!
            </p>
            <Star className="h-5 w-5 text-[#F5C400] animate-pulse" />
          </div>
        </div>
        
        <QuestGrid />
      </div>
    </div>
  );
};

export default Quests;
