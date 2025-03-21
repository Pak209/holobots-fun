
import { useState, useEffect } from "react";
import { HOLOBOT_STATS } from "@/types/holobot";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Progress } from "@/components/ui/progress";
import { Cross } from "lucide-react";

interface QuestBattleBannerProps {
  isVisible: boolean;
  isBossQuest: boolean;
  squadHolobotKeys: string[];
  bossHolobotKey: string;
  onComplete: () => void;
}

export const QuestBattleBanner = ({
  isVisible,
  isBossQuest,
  squadHolobotKeys,
  bossHolobotKey,
  onComplete
}: QuestBattleBannerProps) => {
  const [animation, setAnimation] = useState<"entering" | "active" | "exiting" | "hidden">("hidden");
  const [squadHealth, setSquadHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(100);
  
  useEffect(() => {
    if (isVisible) {
      // Start the animation sequence
      setAnimation("entering");
      setSquadHealth(100);
      setBossHealth(100);
      
      // After the entrance animation, start the battle
      const entranceTimer = setTimeout(() => {
        setAnimation("active");
        simulateBattle();
      }, 1000);
      
      return () => clearTimeout(entranceTimer);
    } else {
      setAnimation("hidden");
    }
  }, [isVisible]);
  
  // Simulate the battle with health changes
  const simulateBattle = () => {
    let currentSquadHealth = 100;
    let currentBossHealth = 100;
    let battleEnded = false;
    
    // Create a battle simulation that updates health every 300ms
    const battleInterval = setInterval(() => {
      if (battleEnded) {
        clearInterval(battleInterval);
        return;
      }
      
      // Boss attacks squad
      currentSquadHealth -= Math.floor(Math.random() * 15) + 5;
      setSquadHealth(Math.max(0, currentSquadHealth));
      
      // Squad attacks boss
      currentBossHealth -= Math.floor(Math.random() * 20) + 5;
      setBossHealth(Math.max(0, currentBossHealth));
      
      // Check if battle is over
      if (currentSquadHealth <= 0 || currentBossHealth <= 0) {
        battleEnded = true;
        
        // Trigger exit animation
        setAnimation("exiting");
        
        // Complete after exit animation
        setTimeout(() => {
          onComplete();
          setAnimation("hidden");
        }, 1000);
      }
    }, 300);
    
    // Safety timeout to end battle after 5 seconds if it hasn't ended yet
    setTimeout(() => {
      if (!battleEnded) {
        clearInterval(battleInterval);
        setAnimation("exiting");
        
        setTimeout(() => {
          onComplete();
          setAnimation("hidden");
        }, 1000);
      }
    }, 5000);
  };
  
  if (animation === "hidden") return null;
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm
      ${animation === "entering" ? "animate-fadeIn" : 
        animation === "exiting" ? "animate-fadeOut" : ""}`}>
      <div className="max-w-4xl w-full mx-auto p-6">
        <div className="bg-holobots-card rounded-lg border-2 border-holobots-accent p-4 shadow-neon relative">
          <button 
            onClick={() => {
              setAnimation("exiting");
              setTimeout(() => {
                onComplete();
                setAnimation("hidden");
              }, 500);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            <Cross className="h-5 w-5" />
          </button>
          
          <h2 className="text-xl font-bold text-center text-holobots-accent mb-4">
            {isBossQuest ? "BOSS BATTLE" : "EXPLORATION BATTLE"}
          </h2>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Squad Side */}
            <div className="flex-1 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-2">YOUR SQUAD</h3>
              
              <div className="flex flex-col space-y-2 w-full max-w-xs">
                {/* Squad health bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Squad Health</span>
                    <span>{squadHealth}%</span>
                  </div>
                  <Progress value={squadHealth} className="h-2 bg-gray-700" 
                    indicatorClassName="bg-green-500" />
                </div>
                
                {/* Squad Holobots */}
                <div className="grid grid-cols-3 gap-2">
                  {squadHolobotKeys.map((holobotKey, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-holobots-dark-background border-2 border-holobots-accent overflow-hidden">
                        <img 
                          src={getHolobotImagePath(HOLOBOT_STATS[holobotKey]?.name || "UNKNOWN")} 
                          alt={HOLOBOT_STATS[holobotKey]?.name || "Unknown Holobot"} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                      <span className="text-xs mt-1">
                        {HOLOBOT_STATS[holobotKey]?.name || "Unknown"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* VS Icon */}
            <div className="text-2xl font-bold text-red-500">VS</div>
            
            {/* Boss Side */}
            <div className="flex-1 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-2">
                {isBossQuest ? "BOSS HOLOBOT" : "ENEMY HOLOBOT"}
              </h3>
              
              <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
                {/* Boss health bar */}
                <div className="space-y-1 w-full">
                  <div className="flex justify-between text-xs">
                    <span>Boss Health</span>
                    <span>{bossHealth}%</span>
                  </div>
                  <Progress value={bossHealth} className="h-2 bg-gray-700" 
                    indicatorClassName="bg-red-500" />
                </div>
                
                {/* Boss Holobot */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-holobots-dark-background border-2 border-red-500 overflow-hidden">
                    <img 
                      src={getHolobotImagePath(HOLOBOT_STATS[bossHolobotKey]?.name || "UNKNOWN")} 
                      alt={HOLOBOT_STATS[bossHolobotKey]?.name || "Unknown Boss"} 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <span className="text-sm mt-2 font-bold text-red-400">
                    {HOLOBOT_STATS[bossHolobotKey]?.name || "Unknown Boss"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm">
            <p className={`animate-pulse text-${squadHealth > bossHealth ? 'green' : 'red'}-400`}>
              {squadHealth > bossHealth ? 
                "Your squad is winning!" : 
                "The enemy is dealing heavy damage!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
