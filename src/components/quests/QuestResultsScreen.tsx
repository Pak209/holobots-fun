import { useState, useEffect } from "react";
import { HOLOBOT_STATS } from "@/types/holobot";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface QuestResultsScreenProps {
  isVisible: boolean;
  isSuccess: boolean;
  squadHolobotExp: Array<{
    name: string;
    xp: number;
    levelUp: boolean;
    newLevel: number;
  }>;
  blueprintRewards?: {
    holobotKey: string;
    amount: number;
  };
  holosRewards: number;
  onClose: () => void;
  gachaTickets?: number;
  arenaPass?: number;
  squadHolobotKeys?: string[]; // Added but not used internally
}

export const QuestResultsScreen = ({
  isVisible,
  isSuccess,
  squadHolobotExp,
  blueprintRewards,
  holosRewards,
  onClose,
  gachaTickets,
  arenaPass,
}: QuestResultsScreenProps) => {
  if (!isVisible) return null;

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
        <div className="bg-holobots-card rounded-lg border-2 border-holobots-accent p-6 shadow-neon">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-holobots-accent">
              Quest {isSuccess ? "Successful!" : "Failed"}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          {/* Rewards */}
          <div className="mb-6 p-3 bg-black/40 rounded-lg border border-holobots-accent/30">
            <h3 className="text-md font-semibold mb-2">Rewards Earned</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-yellow-400 text-sm font-bold">H</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Holos Tokens</p>
                  <p className="text-md font-bold text-yellow-400">{holosRewards}</p>
                </div>
              </div>
              
              {blueprintRewards && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-400 text-sm font-bold">BP</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Blueprint Pieces</p>
                    <p className="text-md font-bold text-purple-400">
                      {blueprintRewards.amount} {HOLOBOT_STATS[blueprintRewards.holobotKey]?.name || ""}
                    </p>
                  </div>
                </div>
              )}
              
              {gachaTickets && gachaTickets > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-400 text-sm font-bold">G</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Gacha Tickets</p>
                    <p className="text-md font-bold text-green-400">{gachaTickets}</p>
                  </div>
                </div>
              )}
              
              {arenaPass && arenaPass > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-sm font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Arena Passes</p>
                    <p className="text-md font-bold text-blue-400">{arenaPass}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Experience Gained */}
          <div>
            <h3 className="text-md font-semibold mb-2">Experience Gained</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {squadHolobotExp.map((expInfo, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  expInfo.levelUp ? 'bg-green-500/10 border-green-500/30' : 'bg-black/30 border-gray-700/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-holobots-dark-background overflow-hidden border border-holobots-accent">
                      <img 
                        src={getHolobotImagePath(expInfo.name)} 
                        alt={expInfo.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{expInfo.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-holobots-accent/20 rounded">
                          {expInfo.levelUp ? `LEVEL UP! → ${expInfo.newLevel}` : `Level ${expInfo.newLevel}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-holobots-accent">+{expInfo.xp} XP</span>
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
          
          <div className="mt-6 flex justify-center">
            <Button onClick={handleClose} className="bg-holobots-accent hover:bg-holobots-hover text-white">
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
