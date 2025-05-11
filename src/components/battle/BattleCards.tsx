import { HolobotCard } from "../HolobotCard";
import { ExperienceBar } from "../ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useAuth } from "@/contexts/auth";

interface BattleCardsProps {
  selectedLeftHolobot: string;
  selectedRightHolobot: string;
  leftLevel: number;
  rightLevel: number;
  leftXp: number;
  rightXp: number;
  leftStats: any;
  rightStats: any;
}

export const BattleCards = ({
  selectedLeftHolobot,
  selectedRightHolobot,
  leftLevel,
  rightLevel,
  leftXp,
  rightXp,
  leftStats,
  rightStats
}: BattleCardsProps) => {
  console.log("BattleCards rendering with:", {
    left: selectedLeftHolobot,
    right: selectedRightHolobot,
    leftLevel,
    rightLevel,
    leftStats,
    rightStats
  });
  
  const { user } = useAuth();
  
  // Find user's holobot to apply attribute boosts - use exact name match
  const userLeftHolobot = user?.holobots?.find(h => 
    h.name.toLowerCase() === (leftStats?.name || '').toLowerCase()
  );
  
  // Log to check if we found the user's holobot
  console.log("Found user's holobot?", {
    leftStats: leftStats?.name,
    userLeftHolobot: userLeftHolobot?.name,
    userLeftLevel: userLeftHolobot?.level,
    propLevel: leftLevel,
    boostedAttributes: userLeftHolobot?.boostedAttributes
  });
  
  // Always prioritize the user's holobot level if available
  const effectiveLeftLevel = userLeftHolobot?.level || leftLevel;
  
  return (
    <div className="flex justify-center gap-2 mb-2">
      <div className="flex flex-col items-center">
        <div className="w-[150px] sm:w-auto">
          <HolobotCard 
            stats={{
              ...leftStats, 
              level: effectiveLeftLevel,
              name: leftStats.name
            }} 
            variant="blue" 
          />
        </div>
        <ExperienceBar 
          {...getExperienceProgress(leftXp, effectiveLeftLevel)}
          level={effectiveLeftLevel}
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
              level: rightLevel,
              name: rightStats.name
            }} 
            variant="red" 
          />
        </div>
      </div>
    </div>
  );
};
