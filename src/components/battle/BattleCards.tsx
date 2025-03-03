
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
  
  return (
    <div className="flex justify-center gap-2 mb-2">
      <div className="flex flex-col">
        <HolobotCard 
          stats={{
            ...HOLOBOT_STATS[selectedLeftHolobot], 
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
            ...HOLOBOT_STATS[selectedRightHolobot], 
            level: rightLevel
          }} 
          variant="red" 
        />
      </div>
    </div>
  );
};
