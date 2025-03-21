
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
  
  const { user } = useAuth();
  
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
  
  // Find user's holobot to apply attribute boosts
  const userLeftHolobot = user?.holobots?.find(h => 
    h.name.toLowerCase() === (leftHolobotStats?.name || '').toLowerCase()
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
  
  console.log(`Left holobot: ${normalizedLeftKey}, Found stats: ${!!leftHolobotStats}`);
  console.log(`Right holobot: ${normalizedRightKey}, Found stats: ${!!rightHolobotStats}`);
  
  // Apply attribute boosts from user's holobot
  const applyAttributeBoosts = (baseStats, userHolobot) => {
    if (!userHolobot || !userHolobot.boostedAttributes) return baseStats;
    
    return {
      ...baseStats,
      attack: baseStats.attack + (userHolobot.boostedAttributes.attack || 0),
      defense: baseStats.defense + (userHolobot.boostedAttributes.defense || 0),
      speed: baseStats.speed + (userHolobot.boostedAttributes.speed || 0),
      maxHealth: baseStats.maxHealth + (userHolobot.boostedAttributes.health || 0)
    };
  };
  
  // Apply boosts to the left (player's) holobot
  const boostedLeftStats = applyAttributeBoosts(
    leftHolobotStats || HOLOBOT_STATS.ace, 
    userLeftHolobot
  );
  
  return (
    <div className="flex justify-center gap-2 mb-2">
      <div className="flex flex-col items-center">
        <div className="w-[150px] sm:w-auto">
          <HolobotCard 
            stats={{
              ...boostedLeftStats, 
              level: leftLevel,
              name: normalizedLeftKey // Ensure name is passed in uppercase
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
              ...(rightHolobotStats || HOLOBOT_STATS.ace), 
              level: rightLevel,
              name: normalizedRightKey // Ensure name is passed in uppercase
            }} 
            variant="red" 
          />
        </div>
      </div>
    </div>
  );
};
