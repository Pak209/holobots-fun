
// Add the necessary imports and implement the updated BattleScene component
// This should ensure that:
// 1. Defense mode boosts hack gauge and special attack meters
// 2. All boosts are temporary during battle only
// 3. XP is applied only after battle completes

// Add the necessary imports and update the component props interface to include preserveHolobotStats
// Include the implementation of the defense mode boost

import React, { useState, useEffect, useRef } from "react";
import { HolobotStats, HackType } from "@/types/holobot";
import { HOLOBOT_STATS } from "@/types/holobot";
import { BattleControls } from "./BattleControls";
import { ModeSlider } from "./battle/ModeSlider";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { 
  calculateDamage, 
  applyHackBoost, 
  applySpecialAttack, 
  incrementComboChain, 
  resetComboChain,
  initializeHolobotStats
} from "@/utils/battleUtils";
import { useToast } from "./ui/use-toast";

interface BattleSceneProps {
  leftHolobot: string;
  rightHolobot: string;
  isCpuBattle?: boolean;
  cpuLevel?: number;
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
  applyXpAfterBattle?: boolean;
  pendingXp?: number;
  preserveHolobotStats?: boolean; // New prop to ensure stats are preserved
}

export const BattleScene = ({
  leftHolobot,
  rightHolobot,
  isCpuBattle = false,
  cpuLevel = 1,
  onBattleEnd,
  applyXpAfterBattle = false,
  pendingXp = 0,
  preserveHolobotStats = false // Default to false for backward compatibility
}: BattleSceneProps) => {
  // Set up state for battle
  const [leftStats, setLeftStats] = useState<HolobotStats>(initializeHolobotStats(HOLOBOT_STATS[leftHolobot]));
  const [rightStats, setRightStats] = useState<HolobotStats>(initializeHolobotStats(HOLOBOT_STATS[rightHolobot]));
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isLeftDefenseMode, setIsLeftDefenseMode] = useState(false);
  const [isRightDefenseMode, setIsRightDefenseMode] = useState(false);
  const [leftHackGauge, setLeftHackGauge] = useState(0);
  const [rightHackGauge, setRightHackGauge] = useState(0);
  const [battleInterval, setBattleInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Store original stats to ensure we can reset after battle
  const originalLeftStatsRef = useRef<HolobotStats>(HOLOBOT_STATS[leftHolobot]);
  const originalRightStatsRef = useRef<HolobotStats>(HOLOBOT_STATS[rightHolobot]);
  
  // Reset stats and gauges when holobots change
  useEffect(() => {
    // Save original stats before any modifications
    originalLeftStatsRef.current = { ...HOLOBOT_STATS[leftHolobot] };
    originalRightStatsRef.current = { ...HOLOBOT_STATS[rightHolobot] };
    
    // Initialize with level adjustments for CPU battles
    const leftInitialStats = initializeHolobotStats(HOLOBOT_STATS[leftHolobot]);
    
    let rightInitialStats = initializeHolobotStats(HOLOBOT_STATS[rightHolobot]);
    if (isCpuBattle && cpuLevel > 1) {
      // Only apply level scaling to CPU opponent, not permanent stat changes
      const levelScaling = 1 + ((cpuLevel - 1) * 0.1);
      rightInitialStats = {
        ...rightInitialStats,
        attack: rightInitialStats.attack * levelScaling,
        defense: rightInitialStats.defense * levelScaling,
        speed: rightInitialStats.speed * levelScaling,
        maxHealth: rightInitialStats.maxHealth * (1 + ((cpuLevel - 1) * 0.2))
      };
    }
    
    setLeftStats(leftInitialStats);
    setRightStats(rightInitialStats);
    setLeftHackGauge(0);
    setRightHackGauge(0);
    setIsBattleStarted(false);
    setBattleLog([]);
    setIsLeftDefenseMode(false);
    setIsRightDefenseMode(false);
  }, [leftHolobot, rightHolobot, cpuLevel, isCpuBattle]);
  
  // Apply defense mode boost (more hack gauge, more special attack gauge)
  const handleDefenseModeBoost = () => {
    // Boost hack gauge by 15% when entering defense mode
    setLeftHackGauge(prev => Math.min(100, prev + 15));
    
    // Add defensive boost temporarily
    setLeftStats(prevStats => ({
      ...prevStats,
      defense: prevStats.defense * 1.15, // 15% defense boost in defense mode
    }));
    
    // Log the defensive stance
    addToBattleLog(`${leftStats.name} takes a defensive stance (+15% defense, +15% hack gauge)`, "info");
  };
  
  // Handle hack button
  const handleHack = (type: HackType) => {
    if (!isBattleStarted) return;
    
    // Apply the hack boost based on type and update hack gauge
    const boostedStats = applyHackBoost(leftStats, type);
    setLeftStats(boostedStats);
    setLeftHackGauge(0); // Reset hack gauge after use
    
    // Log the hack action
    addToBattleLog(`${leftStats.name} uses ${type.replace('_', ' ')} hack!`, "hack");
    
    if (type === 'heal') {
      addToBattleLog(`${leftStats.name} restored health`, "heal");
    } else if (type === 'special_attack') {
      addToBattleLog(`${leftStats.name} unleashes a powerful special attack!`, "special");
    }
  };
  
  // Handle battle actions
  const handleHypeUp = () => {
    if (!isBattleStarted) return;
    
    // Increase hack gauge
    setLeftHackGauge(prev => Math.min(100, prev + 10));
    
    // Decrease opponent's hack gauge
    setRightHackGauge(prev => Math.max(0, prev - 5));
    
    // Log the hype action
    addToBattleLog(`${leftStats.name} powers up! Hack gauge +10%`, "hype");
  };
  
  // Handle battle start/stop
  const handleBattleToggle = () => {
    if (isBattleStarted) {
      // Stop the battle and clear interval
      if (battleInterval) {
        clearInterval(battleInterval);
        setBattleInterval(null);
      }
      setIsBattleStarted(false);
      
      // If the battle is ending, apply XP if needed
      if (applyXpAfterBattle && pendingXp > 0) {
        // Show toast for XP gain
        toast({
          title: `${leftStats.name} gained experience!`,
          description: `+${pendingXp} XP`,
          variant: "default"
        });
      }
      
      // Reset stats to original values to prevent permanent changes
      if (preserveHolobotStats) {
        setLeftStats(initializeHolobotStats(originalLeftStatsRef.current));
        setRightStats(initializeHolobotStats(originalRightStatsRef.current));
      }
      
      addToBattleLog("Battle ended", "system");
    } else {
      // Start the battle
      setIsBattleStarted(true);
      setBattleLog(["Battle started"]);
      
      // Set up battle interval
      const interval = setInterval(() => {
        battleTick();
      }, 2000);
      
      setBattleInterval(interval);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (battleInterval) {
        clearInterval(battleInterval);
      }
    };
  }, [battleInterval]);
  
  // Battle tick - main battle logic
  const battleTick = () => {
    if (!isBattleStarted) return;
    
    // Update stats based on battle state
    setLeftStats(prevStats => {
      const updatedStats = { ...prevStats };
      // Increase special attack gauge
      updatedStats.specialAttackGauge = Math.min(
        updatedStats.specialAttackThreshold || 5,
        (updatedStats.specialAttackGauge || 0) + 1
      );
      
      // Defense mode: Accumulate more special attack gauge
      if (isLeftDefenseMode) {
        updatedStats.specialAttackGauge = Math.min(
          updatedStats.specialAttackThreshold || 5,
          (updatedStats.specialAttackGauge || 0) + 0.5
        );
      }
      
      // Defense mode: Accumulate more hack gauge
      if (isLeftDefenseMode) {
        setLeftHackGauge(prev => Math.min(100, prev + 5));
      } else {
        setLeftHackGauge(prev => Math.min(100, prev + 2));
      }
      
      return updatedStats;
    });
    
    // Similar logic for right side (CPU)
    setRightStats(prevStats => {
      const updatedStats = { ...prevStats };
      updatedStats.specialAttackGauge = Math.min(
        updatedStats.specialAttackThreshold || 5,
        (updatedStats.specialAttackGauge || 0) + 1
      );
      
      if (isRightDefenseMode) {
        updatedStats.specialAttackGauge = Math.min(
          updatedStats.specialAttackThreshold || 5,
          (updatedStats.specialAttackGauge || 0) + 0.5
        );
        setRightHackGauge(prev => Math.min(100, prev + 5));
      } else {
        setRightHackGauge(prev => Math.min(100, prev + 2));
      }
      
      return updatedStats;
    });
    
    // Determine who attacks first based on speed
    const leftAttacksFirst = leftStats.speed > rightStats.speed;
    
    // Perform battle actions
    if (leftAttacksFirst) {
      performAttack("left");
      
      // Check if right is defeated
      if (rightStats.hp && rightStats.hp <= 0) {
        endBattle("left");
        return;
      }
      
      performAttack("right");
      
      // Check if left is defeated
      if (leftStats.hp && leftStats.hp <= 0) {
        endBattle("right");
        return;
      }
    } else {
      performAttack("right");
      
      // Check if left is defeated
      if (leftStats.hp && leftStats.hp <= 0) {
        endBattle("right");
        return;
      }
      
      performAttack("left");
      
      // Check if right is defeated
      if (rightStats.hp && rightStats.hp <= 0) {
        endBattle("left");
        return;
      }
    }
    
    // CPU battle logic - make decisions for the CPU
    if (isCpuBattle) {
      makeCpuDecision();
    }
  };
  
  // Handle attack logic
  const performAttack = (attacker: "left" | "right") => {
    const attackerStats = attacker === "left" ? leftStats : rightStats;
    const defenderStats = attacker === "left" ? rightStats : leftStats;
    const isDefenseMode = attacker === "left" ? isLeftDefenseMode : isRightDefenseMode;
    
    // Skip attack if in defense mode
    if (isDefenseMode) {
      addToBattleLog(`${attackerStats.name} is defending`, "defense");
      return;
    }
    
    // Calculate damage
    let damage = calculateDamage(attackerStats, defenderStats);
    
    // Check for special attack
    if (attackerStats.specialAttackGauge && attackerStats.specialAttackGauge >= attackerStats.specialAttackThreshold) {
      // Apply special attack
      const specialStats = applySpecialAttack(attackerStats);
      
      if (attacker === "left") {
        setLeftStats(prev => ({
          ...prev,
          specialAttackGauge: 0,
          ...specialStats
        }));
      } else {
        setRightStats(prev => ({
          ...prev,
          specialAttackGauge: 0,
          ...specialStats
        }));
      }
      
      // Recalculate damage with special attack boost
      damage = calculateDamage(specialStats, defenderStats);
      
      addToBattleLog(`${attackerStats.name} uses ${attackerStats.specialMove || "Special Attack"}!`, "special");
      addToBattleLog(`${attackerStats.name} deals ${damage} damage to ${defenderStats.name}`, "damage");
    } else {
      addToBattleLog(`${attackerStats.name} attacks ${defenderStats.name} for ${damage} damage`, "attack");
    }
    
    // Apply damage
    if (attacker === "left") {
      setRightStats(prev => ({
        ...prev,
        hp: Math.max(0, (prev.hp || 100) - damage)
      }));
      
      // Increment combo chain for left
      setLeftStats(incrementComboChain);
    } else {
      setLeftStats(prev => ({
        ...prev,
        hp: Math.max(0, (prev.hp || 100) - damage)
      }));
      
      // Increment combo chain for right
      setRightStats(incrementComboChain);
    }
  };
  
  // CPU decision making
  const makeCpuDecision = () => {
    // Random chance to change stance
    if (Math.random() < 0.15) {
      setIsRightDefenseMode(prev => !prev);
      addToBattleLog(`${rightStats.name} ${!isRightDefenseMode ? "takes a defensive stance" : "switches to attack mode"}`, "info");
    }
    
    // Use hack if available
    if (rightHackGauge >= 100) {
      // Use special attack
      setRightStats(prevStats => applyHackBoost(prevStats, "special_attack"));
      setRightHackGauge(0);
      addToBattleLog(`${rightStats.name} uses special attack hack!`, "hack");
    } else if (rightHackGauge >= 75 && rightStats.hp && rightStats.hp < 50) {
      // Use heal if low on health
      setRightStats(prevStats => applyHackBoost(prevStats, "heal"));
      setRightHackGauge(0);
      addToBattleLog(`${rightStats.name} uses heal hack!`, "heal");
    } else if (rightHackGauge >= 50 && Math.random() < 0.3) {
      // Use attack or speed boost
      const boostType = Math.random() < 0.5 ? "attack" : "speed";
      setRightStats(prevStats => applyHackBoost(prevStats, boostType as HackType));
      setRightHackGauge(0);
      addToBattleLog(`${rightStats.name} uses ${boostType} hack!`, "hack");
    }
  };
  
  // End battle and determine winner
  const endBattle = (winner: "left" | "right") => {
    if (battleInterval) {
      clearInterval(battleInterval);
      setBattleInterval(null);
    }
    
    setIsBattleStarted(false);
    addToBattleLog(`${winner === "left" ? leftStats.name : rightStats.name} wins the battle!`, "victory");
    
    // Call the onBattleEnd callback if provided
    if (onBattleEnd) {
      onBattleEnd(winner === "left" ? "victory" : "defeat");
    }
    
    // If preserving stats, reset to originals
    if (preserveHolobotStats) {
      setLeftStats(initializeHolobotStats(originalLeftStatsRef.current));
      setRightStats(initializeHolobotStats(originalRightStatsRef.current));
    }
  };
  
  // Add message to battle log
  const addToBattleLog = (message: string, type: string = "info") => {
    setBattleLog(prev => [...prev, message]);
    
    // Log to console for debugging
    console.log(`[Battle ${type}]:`, message);
  };
  
  // Calculate health percentage for display
  const getHealthPercentage = (stats: HolobotStats) => {
    return Math.max(0, Math.min(100, ((stats.hp || 100) / (stats.maxHealth || 100)) * 100));
  };
  
  // Render the battle scene
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left side - Player */}
      <Card className="lg:col-span-5 p-4 bg-holobots-card border-holobots-border rounded-lg">
        <div className="text-center font-bold text-holobots-text mb-2">
          {leftStats.name} (Level {leftStats.level || 1})
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>HP</span>
            <span>{Math.floor(leftStats.hp || 100)}/{leftStats.maxHealth || 100}</span>
          </div>
          <Progress 
            value={getHealthPercentage(leftStats)} 
            className="h-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-sm">
            <div className="text-holobots-text">Attack</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor(leftStats.attack)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-holobots-text">Defense</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor(leftStats.defense)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-holobots-text">Speed</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor(leftStats.speed)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-holobots-text">Special</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor((leftStats.specialAttackGauge || 0))}/{leftStats.specialAttackThreshold || 5}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between gap-2 mb-2">
          <ModeSlider 
            isDefense={isLeftDefenseMode}
            onModeChange={setIsLeftDefenseMode}
            disabled={!isBattleStarted}
            onDefenseModeBoost={handleDefenseModeBoost} // New boost function
          />
          
          <BattleControls 
            onStartBattle={handleBattleToggle}
            onHypeUp={handleHypeUp}
            onHack={handleHack}
            isBattleStarted={isBattleStarted}
            hackGauge={leftHackGauge}
          />
        </div>
      </Card>
      
      {/* Battle Log */}
      <Card className="lg:col-span-2 p-2 bg-holobots-card border-holobots-border rounded-lg overflow-hidden">
        <div className="text-center font-bold text-holobots-text mb-2 text-xs">
          Battle Log
        </div>
        <div className="h-40 md:h-52 overflow-y-auto text-xs space-y-1 p-1">
          {battleLog.map((log, index) => (
            <div key={index} className="text-holobots-text border-b border-holobots-border/20 pb-1">
              {log}
            </div>
          ))}
        </div>
      </Card>
      
      {/* Right side - Opponent */}
      <Card className="lg:col-span-5 p-4 bg-holobots-card border-holobots-border rounded-lg">
        <div className="text-center font-bold text-holobots-text mb-2">
          {rightStats.name} {isCpuBattle ? `(Level ${cpuLevel})` : ''}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>HP</span>
            <span>{Math.floor(rightStats.hp || 100)}/{rightStats.maxHealth || 100}</span>
          </div>
          <Progress 
            value={getHealthPercentage(rightStats)} 
            className="h-2"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-sm">
            <div className="text-holobots-text">Attack</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor(rightStats.attack)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-holobots-text">Defense</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor(rightStats.defense)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-holobots-text">Speed</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor(rightStats.speed)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-holobots-text">Special</div>
            <div className="bg-holobots-background p-1 rounded text-center">
              {Math.floor((rightStats.specialAttackGauge || 0))}/{rightStats.specialAttackThreshold || 5}
            </div>
          </div>
        </div>
        
        <div className="h-9 flex justify-between items-center">
          <div className="text-sm text-holobots-text">
            {isRightDefenseMode ? 'Defense Mode' : 'Attack Mode'}
          </div>
          <div className="bg-holobots-background p-1 rounded-lg text-xs flex items-center">
            <span className="text-yellow-400 mr-1">Hack:</span>
            <Progress 
              value={rightHackGauge} 
              className="w-20 h-2"
            />
            <span className="ml-1">{Math.floor(rightHackGauge)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
