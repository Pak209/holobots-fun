import { useAuth } from "@/contexts/auth";
import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { DailyMissionsPanel } from "@/components/rewards/DailyMissionsPanel";
import { SeasonalRentalCard } from "@/components/rental/SeasonalRentalCard";

const Dashboard = () => {
  const { user } = useAuth();

  console.log("Dashboard - Current user:", user);

  // Get user's holobots from state and deduplicate
  const allUserHolobots = user?.holobots || [];
  const uniqueHolobots = Array.from(new Map(allUserHolobots.map(bot =>
    [`${bot.name}-${bot.level}`, bot])).values()
  );

  const activeRentals = (user?.rental_holobots || []).filter(r => !r.isExpired);

  return (
    <div className="flex flex-col gap-5 px-4 py-2">
      {/* Daily Missions Section - Now prioritized at the top */}
      <div className="rounded-xl bg-[#1A1F2C] p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-white">Daily Missions</h2>
          <Link to="/booster-packs?tab=rewards" className="text-[#D6BCFA] text-sm flex items-center">
            View all rewards <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <DailyMissionsPanel />
      </div>
      
      {/* Seasonal Rentals Section */}
      {activeRentals.length > 0 && (
        <div className="rounded-xl bg-[#1A1F2C] p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-400" />
              Seasonal Rentals
            </h2>
            <Link to="/app" className="text-[#D6BCFA] text-sm flex items-center">
              View blueprints <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeRentals.map((rental) => (
              <SeasonalRentalCard 
                key={rental.id} 
                rental={rental}
                stockpileStakeAmount={0} // TODO: Get from stockpile store if needed
              />
            ))}
          </div>
        </div>
      )}
      
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
