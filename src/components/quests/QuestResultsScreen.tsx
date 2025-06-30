import { useState, useEffect } from "react";
import { HOLOBOT_STATS } from "@/types/holobot";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Button } from "@/components/ui/button";
import { XCircle, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuestResultsScreenProps {
  isVisible: boolean;
  isSuccess: boolean;
  squadHolobotKeys: string[];
  squadHolobotExp: Array<{name: string, xp: number, levelUp: boolean, newLevel: number}> | [];
  blueprintRewards?: {
    holobotKey: string;
    amount: number;
  } | null;
  holosRewards?: number;
  gachaTickets?: number;
  arenaPass?: number;
  itemRewards?: { 
    energy_refills: number; 
    exp_boosters: number; 
    rank_skips: number; 
  };
  title?: string; // Optional custom title
  onClose: () => void;
}

export const QuestResultsScreen = ({
  isVisible,
  isSuccess,
  squadHolobotKeys,
  squadHolobotExp,
  blueprintRewards,
  holosRewards,
  gachaTickets,
  arenaPass,
  itemRewards,
  title,
  onClose
}: QuestResultsScreenProps) => {
  const [animation, setAnimation] = useState<"entering" | "active" | "exiting" | "hidden">("hidden");
  
  useEffect(() => {
    if (isVisible) {
      setAnimation("entering");
      
      // After entrance animation, set to active
      const timer = setTimeout(() => {
        setAnimation("active");
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setAnimation("hidden");
    }
  }, [isVisible]);
  
  const handleClose = () => {
    setAnimation("exiting");
    setTimeout(() => {
      onClose();
      setAnimation("hidden");
    }, 500);
  };
  
  if (animation === "hidden") return null;
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm
      ${animation === "entering" ? "animate-fadeIn" : 
        animation === "exiting" ? "animate-fadeOut" : ""}`}>
      <div className="max-w-2xl w-full mx-auto p-4">
        <div className="bg-[#1A1F2C] rounded-lg border-2 border-cyan-500 p-6 shadow-neon">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cyan-400 font-orbitron">
              {title || `Quest ${isSuccess ? "Successful!" : "Failed"}`}
            </h2>
            <button onClick={handleClose} className="text-gray-200 hover:text-white">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          {/* Rewards */}
          <div className="mb-6 p-3 bg-black/40 rounded-lg border border-cyan-500/30">
            <h3 className="text-md font-semibold mb-2 text-red-400">Rewards Earned</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 text-sm font-bold">H</span>
                </div>
                <div>
                  <p className="text-xs text-gray-200">Holos Tokens</p>
                  <p className="text-md font-bold text-yellow-400">{holosRewards}</p>
                </div>
              </div>
              
              {blueprintRewards && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 text-sm font-bold">BP</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-200">Blueprint Pieces</p>
                    <p className="text-md font-bold text-purple-400">
                      {blueprintRewards.amount} {HOLOBOT_STATS[blueprintRewards.holobotKey]?.name || ""}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Experience Gained */}
          <div>
            <h3 className="text-md font-semibold mb-2 text-red-400">Experience Gained</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {squadHolobotExp.map((expInfo, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  expInfo.levelUp ? 'bg-green-500/10 border-green-500/30' : 'bg-black/30 border-gray-700/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/50 overflow-hidden border border-cyan-500">
                      <img 
                        src={getHolobotImagePath(expInfo.name)} 
                        alt={expInfo.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white">{expInfo.name}</span>
                        <span className="text-xs text-white px-2 py-0.5 bg-cyan-500/20 rounded">
                          {expInfo.levelUp ? `LEVEL UP! → ${expInfo.newLevel}` : `Level ${expInfo.newLevel}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-cyan-400">+{expInfo.xp} XP</span>
                        {expInfo.levelUp && (
                          <span className="text-green-400 animate-pulse">LEVEL UP!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Item Rewards Display */}
          {itemRewards && (itemRewards.energy_refills > 0 || itemRewards.exp_boosters > 0 || itemRewards.rank_skips > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <h4 className="text-md font-semibold text-holobots-accent mb-1 text-center">Items Acquired:</h4>
              <div className="flex justify-center items-center gap-2 text-xs">
                {itemRewards.energy_refills > 0 && (
                  <span className="flex items-center bg-gray-700 px-2 py-1 rounded">
                    <Star className="h-3 w-3 text-white mr-1" /> Energy Refills x{itemRewards.energy_refills}
                  </span>
                )}
                {itemRewards.exp_boosters > 0 && (
                  <span className="flex items-center bg-blue-700 px-2 py-1 rounded">
                    <Star className="h-3 w-3 text-blue-300 mr-1" /> EXP Boosters x{itemRewards.exp_boosters}
                  </span>
                )}
                {itemRewards.rank_skips > 0 && (
                  <span className="flex items-center bg-purple-700 px-2 py-1 rounded">
                    <Star className="h-3 w-3 text-purple-300 mr-1" /> Rank Skips x{itemRewards.rank_skips}
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <Button onClick={handleClose} className="bg-red-500 hover:bg-red-600 text-white">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
