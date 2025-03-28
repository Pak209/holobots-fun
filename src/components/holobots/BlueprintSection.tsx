import React from "react";
import { useAuth } from "@/contexts/auth";
import { Progress } from "@/components/ui/progress";

interface BlueprintSectionProps {
  holobotKey: string;
  holobotName: string;
}

export const BLUEPRINT_TIERS = {
  tier1: { name: "Tier 1", required: 10, color: "#6366f1" },
  tier2: { name: "Tier 2", required: 25, color: "#8b5cf6" },
  tier3: { name: "Tier 3", required: 50, color: "#ec4899" },
  tier4: { name: "Tier 4", required: 100, color: "#f59e0b" },
  tier5: { name: "Tier 5", required: 200, color: "#ef4444" },
};

export const BlueprintSection: React.FC<BlueprintSectionProps> = ({ holobotKey, holobotName }) => {
  const { user } = useAuth();
  
  // Get the number of blueprint pieces collected for this holobot
  const blueprintCount = user?.blueprints && user.blueprints[holobotKey] 
    ? user.blueprints[holobotKey] 
    : 0;
  
  // Find the highest blueprint tier achieved
  const currentTier = Object.entries(BLUEPRINT_TIERS).reduce((highest, [tierKey, tierData]) => {
    if (blueprintCount >= tierData.required && tierData.required > highest.required) {
      return { tier: tierKey, ...tierData };
    }
    return highest;
  }, { tier: "none", name: "None", required: 0, color: "#94a3b8" });
  
  // Find the next tier to achieve
  const nextTier = Object.entries(BLUEPRINT_TIERS).reduce((next, [tierKey, tierData]) => {
    if (blueprintCount < tierData.required && 
        (next.required === 0 || tierData.required < next.required)) {
      return { tier: tierKey, ...tierData };
    }
    return next;
  }, { tier: "max", name: "Max", required: 0, color: "#ef4444" });
  
  // Calculate progress to next tier
  let progress = 100;
  let tierProgress = "";
  
  if (nextTier.tier !== "max") {
    const prevTierRequired = currentTier.tier === "none" ? 0 : currentTier.required;
    const remaining = nextTier.required - prevTierRequired;
    const achieved = blueprintCount - prevTierRequired;
    progress = Math.floor((achieved / remaining) * 100);
    tierProgress = `${blueprintCount}/${nextTier.required}`;
  } else {
    tierProgress = `${blueprintCount} (Max)`;
  }

  console.log(`Blueprint display for ${holobotName}:`, { 
    holobotKey, 
    blueprintCount, 
    currentTier, 
    nextTier, 
    progress 
  });
  
  return (
    <div className="bg-holobots-card dark:bg-holobots-dark-card rounded-lg border border-holobots-border dark:border-holobots-dark-border p-3 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-holobots-accent">Blueprint Progress</h3>
        <span className="text-xs text-holobots-text dark:text-holobots-dark-text">{tierProgress}</span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between text-[10px]">
        <span style={{ color: currentTier.color }}>{currentTier.name}</span>
        {nextTier.tier !== "max" && (
          <span style={{ color: nextTier.color }}>{nextTier.name}</span>
        )}
      </div>
      
      <div className="text-[9px] text-gray-400 mt-1">
        Collect blueprint pieces from Quests to unlock special abilities
      </div>
    </div>
  );
};
