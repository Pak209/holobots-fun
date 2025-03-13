
import { useAuth } from "@/contexts/AuthContext";
import { HOLOBOT_STATS, BLUEPRINT_TIERS } from "@/types/holobot";
import { BlueprintCard } from "@/components/marketplace/BlueprintCard";

export const BlueprintInventory = () => {
  const { user } = useAuth();
  
  // Get blueprint pieces from user profile
  const blueprintPieces = user?.blueprintPieces || {};
  
  // Only show blueprints that the user has pieces for
  const hasBlueprintPieces = Object.values(blueprintPieces).some(count => count > 0);

  if (!hasBlueprintPieces) {
    return null;
  }

  return (
    <div className="w-full bg-holobots-card/50 dark:bg-holobots-dark-card p-4 rounded-lg border border-holobots-border dark:border-holobots-dark-border mb-6">
      <h2 className="text-xl font-bold text-holobots-accent mb-4">Your Blueprint Pieces</h2>
      
      <div className="flex flex-wrap gap-4">
        {Object.entries(blueprintPieces).map(([holobotKey, count]) => {
          if (count <= 0) return null;
          
          // Get the highest tier that can be achieved with this many pieces
          const { tier } = getHighestPossibleTier(count);
          const tierLevel = BLUEPRINT_TIERS[tier as keyof typeof BLUEPRINT_TIERS].level;
          
          // Get holobot name from key (capitalize first letter)
          const holobotName = HOLOBOT_STATS[holobotKey]?.name || 
                             (holobotKey.charAt(0).toUpperCase() + holobotKey.slice(1));
          
          return (
            <div key={holobotKey} className="flex flex-col items-center">
              <BlueprintCard 
                holobotName={holobotName}
                tier={Object.keys(BLUEPRINT_TIERS).indexOf(tier) + 1}
                quantity={count}
              />
              <div className="mt-1 text-center">
                <span className="text-xs">Best Tier: </span>
                <span className="text-xs font-semibold text-holobots-accent">
                  {BLUEPRINT_TIERS[tier as keyof typeof BLUEPRINT_TIERS].name} (Lv. {tierLevel})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getHighestPossibleTier(pieces: number) {
  if (pieces >= BLUEPRINT_TIERS.legendary.pieces) return { tier: 'legendary', level: BLUEPRINT_TIERS.legendary.level };
  if (pieces >= BLUEPRINT_TIERS.elite.pieces) return { tier: 'elite', level: BLUEPRINT_TIERS.elite.level };
  if (pieces >= BLUEPRINT_TIERS.rare.pieces) return { tier: 'rare', level: BLUEPRINT_TIERS.rare.level };
  if (pieces >= BLUEPRINT_TIERS.champion.pieces) return { tier: 'champion', level: BLUEPRINT_TIERS.champion.level };
  return { tier: 'common', level: BLUEPRINT_TIERS.common.level };
}
