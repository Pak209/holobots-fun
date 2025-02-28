
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Bolt, Coins, Sword, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data for user holobots (would come from user state in a real app)
  const userHolobots = [
    { name: "ace", level: 5 },
    { name: "kuma", level: 3 },
    { name: "shadow", level: 4 }
  ];

  return (
    <div className="flex flex-col gap-5 px-4 py-2">
      {/* Player Card */}
      <div className="rounded-xl bg-[#1A1F2C] p-4">
        <h2 className="text-xl font-bold text-white mb-1">Player</h2>
        <p className="text-[#8E9196] mb-4">Level {user?.level || 1}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Bolt className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">10</span>
            <span className="text-[#8E9196] text-xs">Sync Points</span>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Coins className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">100</span>
            <span className="text-[#8E9196] text-xs">Holos</span>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Sword className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">0</span>
            <span className="text-[#8E9196] text-xs">Battles</span>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Trophy className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">0</span>
            <span className="text-[#8E9196] text-xs">Victories</span>
          </div>
        </div>
      </div>
      
      {/* Recent Battles Section */}
      <div className="rounded-xl bg-[#1A1F2C] p-4">
        <h2 className="text-xl font-bold text-white mb-2">Recent Battles</h2>
        <p className="text-[#8E9196] text-sm">No battles yet</p>
      </div>
      
      {/* Holobots Section */}
      <div className="rounded-xl bg-[#1A1F2C] p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-white">Your Holobots</h2>
          <Link to="/holobots-info" className="text-[#D6BCFA] text-sm flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {userHolobots.map((bot, index) => (
            <div key={index} className="min-w-[100px] flex-shrink-0">
              <HolobotCard 
                stats={{
                  ...HOLOBOT_STATS[bot.name as keyof typeof HOLOBOT_STATS],
                  level: bot.level
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
