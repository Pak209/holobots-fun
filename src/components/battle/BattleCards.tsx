
import { HolobotCard } from "../HolobotCard";
import { ExperienceBar } from "../ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { HOLOBOT_STATS, HolobotStats } from "@/types/holobot";

interface BattleCardsProps {
  leftStats: HolobotStats;
  rightStats: HolobotStats;
  leftLevel: number;
  rightLevel: number;
  leftXp: number;
  rightXp: number;
}

export const BattleCards = ({
  leftStats,
  rightStats,
  leftLevel,
  rightLevel,
  leftXp,
  rightXp
}: BattleCardsProps) => {
  console.log("BattleCards rendering with:", {
    left: leftStats.name,
    right: rightStats.name,
    leftLevel,
    rightLevel
  });

  return (
    <div className="flex justify-center gap-2 mb-2">
      <div className="flex flex-col items-center">
        <div className="w-[150px] sm:w-auto">
          <HolobotCard 
            stats={{
              ...leftStats,
              level: leftLevel
            }} 
            variant="blue" 
          />
        </div>
        <ExperienceBar 
          {...getExperienceProgress(leftXp, leftLevel)}
          level={leftLevel}
        />
      </div>
      <div className="flex items-center">
        <span className="text-holobots-accent font-bold text-xl animate-neon-pulse">VS</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="w-[150px] sm:w-auto">
          <HolobotCard 
            stats={{
              ...rightStats,
              level: rightLevel
            }} 
            variant="red" 
          />
        </div>
        <ExperienceBar 
          {...getExperienceProgress(rightXp, rightLevel)}
          level={rightLevel}
        />
      </div>
    </div>
  );
};
