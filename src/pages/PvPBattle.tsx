
import { useState, useEffect } from "react";
import { NavigationMenu } from "@/components/NavigationMenu";
import { BattleScene } from "@/components/BattleScene";
import { PlayerSearch } from "@/components/battle/PlayerSearch";
import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";

const PvPBattle = () => {
  const defaultLeftHolobot = 'ace';
  const defaultRightHolobot = 'kuma';
  const { user } = useAuth();
  
  // State for tracking selected holobots
  const [leftHolobot, setLeftHolobot] = useState(defaultLeftHolobot);
  const [rightHolobot, setRightHolobot] = useState(defaultRightHolobot);

  // If user has a preferred/strongest holobot, use that instead
  useEffect(() => {
    if (user?.holobots && user.holobots.length > 0) {
      // Sort by level to find the strongest
      const sortedHolobots = [...user.holobots].sort((a, b) => 
        (b.level || 1) - (a.level || 1)
      );
      
      if (sortedHolobots.length > 0) {
        // Find the key for this holobot in HOLOBOT_STATS
        const holobotKey = Object.keys(HOLOBOT_STATS).find(key => 
          HOLOBOT_STATS[key].name.toLowerCase() === sortedHolobots[0].name.toLowerCase()
        );
        
        if (holobotKey) {
          setLeftHolobot(holobotKey);
        }
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-holobots-background dark:bg-holobots-dark-background text-holobots-text dark:text-holobots-dark-text">
      <NavigationMenu />
      <div className="container mx-auto p-4 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BattleScene 
            leftHolobot={leftHolobot}
            rightHolobot={rightHolobot}
          />
          <PlayerSearch />
        </div>
      </div>
    </div>
  );
};

export default PvPBattle;
