
import { HolobotCard } from "../HolobotCard";
import { ExperienceBar } from "../ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { HOLOBOT_STATS } from "@/types/holobot";

interface BattleCardsProps {
  selectedLeftHolobot: string;
  selectedRightHolobot: string;
  leftLevel: number;
  rightLevel: number;
  leftXp: number;
  rightXp: number;
}

export const BattleCards = ({
  selectedLeftHolobot,
  selectedRightHolobot,
  leftLevel,
  rightLevel,
  leftXp,
  rightXp
}: BattleCardsProps) => {
  console.log("BattleCards rendering with:", {
    left: selectedLeftHolobot,
    right: selectedRightHolobot,
    leftLevel,
    rightLevel
  });
  
  // Look up the correct stats objects from HOLOBOT_STATS using normalized keys
  const normalizedLeftKey = selectedLeftHolobot.toUpperCase();
  const normalizedRightKey = selectedRightHolobot.toUpperCase();
  
  // Find the correct stats by normalized key or name property
  const leftHolobotStats = Object.values(HOLOBOT_STATS).find(
    h => h.name.toUpperCase() === normalizedLeftKey
  );
  
  const rightHolobotStats = Object.values(HOLOBOT_STATS).find(
    h => h.name.toUpperCase() === normalizedRightKey
  );
  
  if (!leftHolobotStats || !rightHolobotStats) {
    console.error("Missing holobot stats", { 
      leftKey: selectedLeftHolobot, 
      rightKey: selectedRightHolobot,
      normalizedLeftKey,
      normalizedRightKey,
      leftFound: !!leftHolobotStats,
      rightFound: !!rightHolobotStats,
      availableNames: Object.values(HOLOBOT_STATS).map(h => h.name).join(", ")
    });
  }
  
  return (
    <div className="flex justify-center gap-2 mb-2">
      <div className="flex flex-col">
        <HolobotCard 
          stats={{
            ...(leftHolobotStats || HOLOBOT_STATS.ace), 
            level: leftLevel
          }} 
          variant="blue" 
        />
        <ExperienceBar 
          {...getExperienceProgress(leftXp, leftLevel)}
          level={leftLevel}
        />
      </div>
      <div className="flex items-center">
        <span className="text-holobots-accent font-bold text-xl animate-neon-pulse">VS</span>
      </div>
      <div className="flex flex-col">
        <HolobotCard 
          stats={{
            ...(rightHolobotStats || HOLOBOT_STATS.ace), 
            level: rightLevel
          }} 
          variant="red" 
        />
      </div>
    </div>
  );
};
