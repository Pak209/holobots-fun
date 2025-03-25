
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
  isTcgCompact?: boolean;
}

export const BattleCards = ({
  selectedLeftHolobot,
  selectedRightHolobot,
  leftLevel,
  rightLevel,
  leftXp,
  rightXp,
  isTcgCompact = false
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
  
  // Find user's holobot to apply attribute boosts - use exact name match
  const userLeftHolobot = user?.holobots?.find(h => 
    h.name.toLowerCase() === (leftHolobotStats?.name || '').toLowerCase()
  );
  
  // Log to check if we found the user's holobot
  console.log("Found user's holobot?", {
    leftHolobotStats: leftHolobotStats?.name,
    userLeftHolobot: userLeftHolobot?.name,
    userLeftLevel: userLeftHolobot?.level,
    propLevel: leftLevel,
    boostedAttributes: userLeftHolobot?.boostedAttributes
  });
  
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
  
  // Apply attribute boosts from user's holobot
  const applyAttributeBoosts = (baseStats, userHolobot) => {
    if (!userHolobot || !userHolobot.boostedAttributes) return baseStats;
    
    // Log the attribute boost application
    console.log("Applying boosts:", {
      baseStats,
      boosts: userHolobot.boostedAttributes,
      holobotName: userHolobot.name,
      holobotLevel: userHolobot.level
    });
    
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
  
  // Always prioritize the user's holobot level if available
  const effectiveLeftLevel = userLeftHolobot?.level || leftLevel;
  
  const cardSize = isTcgCompact ? "w-[130px] sm:w-[150px]" : "w-[150px] sm:w-auto";
  
  return (
    <div className="flex justify-center gap-2 mb-2">
      <div className="flex flex-col items-center">
        <div className={cardSize}>
          <HolobotCard 
            stats={{
              ...boostedLeftStats, 
              level: effectiveLeftLevel,
              name: normalizedLeftKey
            }} 
            variant="blue" 
            isCompact={isTcgCompact}
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
        <div className={cardSize}>
          <HolobotCard 
            stats={{
              ...(rightHolobotStats || HOLOBOT_STATS.ace), 
              level: rightLevel,
              name: normalizedRightKey
            }} 
            variant="red" 
            isCompact={isTcgCompact}
          />
        </div>
      </div>
    </div>
  );
};
