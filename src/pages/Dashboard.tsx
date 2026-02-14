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
    <div className="min-h-screen bg-black text-white">
      {/* Sci-Fi HUD Header */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-[#F5C400] to-[#D4A400] border-b-4 border-black" style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
      }}>
        <h1 className="text-base sm:text-xl md:text-2xl font-black text-black uppercase tracking-widest text-center">
          COMMAND CENTER
        </h1>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {/* Daily Missions Section */}
        <div className="bg-black border-4 border-[#F5C400] p-4 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
        }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl font-black text-[#F5C400] uppercase tracking-wider">Daily Missions</h2>
            <Link to="/booster-packs?tab=rewards" className="text-[#F5C400] hover:text-[#D4A400] text-xs sm:text-sm flex items-center font-bold uppercase">
              View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            </Link>
          </div>
          <DailyMissionsPanel />
        </div>
        
        {/* Seasonal Rentals Section */}
        {activeRentals.length > 0 && (
          <div className="bg-black border-4 border-[#F5C400] p-4 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
            clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
          }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg sm:text-xl font-black text-[#F5C400] uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Seasonal Rentals
              </h2>
              <Link to="/app" className="text-[#F5C400] hover:text-[#D4A400] text-xs sm:text-sm flex items-center font-bold uppercase">
                Blueprints <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRentals.map((rental) => (
                <SeasonalRentalCard 
                  key={rental.id} 
                  rental={rental}
                  stockpileStakeAmount={0}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Recent Battles Section */}
        <div className="bg-black border-4 border-[#F5C400] p-4 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
        }}>
          <h2 className="text-lg sm:text-xl font-black text-[#F5C400] uppercase tracking-wider mb-2">Recent Battles</h2>
          <p className="text-gray-400 text-sm uppercase tracking-wide">No battles yet</p>
        </div>
        
        {/* Holobots Section */}
        <div className="bg-black border-4 border-[#F5C400] p-4 shadow-[0_0_20px_rgba(245,196,0,0.3)]" style={{
          clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)'
        }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg sm:text-xl font-black text-[#F5C400] uppercase tracking-wider">Your Holobots</h2>
            <Link to="/holobots-info" className="text-[#F5C400] hover:text-[#D4A400] text-xs sm:text-sm flex items-center font-bold uppercase">
              View All <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
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
              <div className="text-center py-4 w-full">
                <p className="text-gray-400 text-sm mb-3 uppercase tracking-wide">No Holobots yet. Get your Genesis Holobot!</p>
                <Link 
                  to="/mint" 
                  className="inline-flex items-center px-4 py-2 bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-widest border-2 border-black shadow-[0_0_10px_rgba(245,196,0,0.5)] transition-colors"
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                  }}
                >
                  Start Genesis Mint
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
