import { useAuth } from "@/contexts/auth";
import { ArrowRight, Bolt, Coins, Sword, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import React from "react";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isRefilling, setIsRefilling] = React.useState(false);

  console.log("Dashboard - Current user:", user);

  const handleQuickRefill = async () => {
    if (!user || (user.energy_refills || 0) <= 0) {
      toast({
        title: 'No Energy Refills',
        description: "You don't have any Energy Refills to use. Get them from Gacha or Quests!",
        variant: 'destructive',
      });
      return;
    }
    
    if (user.dailyEnergy === user.maxDailyEnergy) {
      toast({
        title: 'Energy Already Full',
        description: "Your energy is already at maximum!",
        variant: 'destructive',
      });
      return;
    }
    
    setIsRefilling(true);
    try {
      await updateUser({
        energy_refills: (user.energy_refills || 0) - 1,
        dailyEnergy: user.maxDailyEnergy,
      });
      toast({
        title: 'Energy Refilled! ⚡',
        description: 'Your daily energy has been restored to full!',
      });
    } catch (error) {
      toast({
        title: 'Refill Failed',
        description: 'Could not refill energy. Try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefilling(false);
    }
  };

  // Get user's holobots from state and deduplicate
  const allUserHolobots = user?.holobots || [];
  const uniqueHolobots = Array.from(new Map(allUserHolobots.map(bot =>
    [`${bot.name}-${bot.level}`, bot])).values()
  );

  return (
    <div className="flex flex-col gap-5 px-4 py-2">
      {/* Player Card */}
      <div className="rounded-xl bg-[#1A1F2C] p-4">
        <h2 className="text-xl font-bold text-white mb-1">Player</h2>
        <p className="text-[#8E9196] mb-4">Level {user?.level || 1}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center relative">
            <Bolt className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">{user?.dailyEnergy || 0}/{user?.maxDailyEnergy || 100}</span>
            <span className="text-[#8E9196] text-xs mb-2">Daily Energy</span>
            
            {/* Quick Refill Section */}
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-[#8E9196] text-xs">Refills: {user?.energy_refills || 0}</span>
              <Button
                size="sm"
                className="w-full h-6 text-xs bg-[#33C3F0] hover:bg-[#0FA0CE] text-black font-semibold px-2 py-1 rounded disabled:opacity-50"
                onClick={handleQuickRefill}
                disabled={
                  isRefilling || 
                  (user?.energy_refills || 0) <= 0 || 
                  user?.dailyEnergy === user?.maxDailyEnergy
                }
                aria-label="Quick Energy Refill"
              >
                {isRefilling ? (
                  <>
                    <Zap className="h-3 w-3 mr-1 animate-pulse" />
                    Refilling...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Quick Refill
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Coins className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">{user?.holosTokens || 0}</span>
            <span className="text-[#8E9196] text-xs">Holos</span>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Sword className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">{user?.stats?.losses || 0}</span>
            <span className="text-[#8E9196] text-xs">Battles</span>
          </div>
          
          <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center">
            <Trophy className="h-6 w-6 text-[#D6BCFA] mb-1" />
            <span className="text-white text-xl font-bold">{user?.stats?.wins || 0}</span>
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
          {uniqueHolobots.length > 0 ? (
            uniqueHolobots.map((bot, index) => (
              <div key={`${bot.name}-${bot.level}-${index}`} className="min-w-[100px] flex-shrink-0">
                <HolobotCard
                  stats={{
                    ...HOLOBOT_STATS[bot.name.toLowerCase() as keyof typeof HOLOBOT_STATS],
                    level: bot.level || 1
                  }}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-[#8E9196] text-sm mb-3">No Holobots yet. Get your Genesis Holobot!</p>
              <Link 
                to="/mint" 
                className="inline-flex items-center px-4 py-2 bg-[#D6BCFA] text-black font-semibold rounded-lg hover:bg-[#C7A7F5] transition-colors"
              >
                Start Genesis Mint
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
