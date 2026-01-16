import { useState, useEffect } from "react";
import { BattleControls } from "./BattleControls";
import { BattleLog } from "./BattleLog";
import { BattleMeters } from "./battle/BattleMeters";
import { BattleCharacters } from "./battle/BattleCharacters";
import { BattleSelectors } from "./battle/BattleSelectors";
import { BattleCards } from "./battle/BattleCards";
import { ModeSlider } from "./battle/ModeSlider";
import { HOLOBOT_STATS } from "@/types/holobot";
import { 
  calculateDamage, 
  calculateExperience, 
  getNewLevel, 
  applyHackBoost, 
  applySpecialAttack, 
  updateHolobotExperience,
  resetComboChain,
  incrementComboChain
} from "@/utils/battleUtils";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "./ui/dialog";

// Define a default structure for safety
const defaultBattleStats = {
  name: 'Unknown',
  attack: 10,
  defense: 10,
  speed: 10,
  maxHealth: 100,
  level: 1,
  specialMove: 'None',
  intelligence: 5 // Added default intelligence
  // Add other required fields from HolobotStats if necessary, with defaults
};

interface BattleSceneProps {
  leftHolobot: string;
  rightHolobot: string;
  isCpuBattle?: boolean;
  cpuLevel?: number;
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
}

export const BattleScene = ({ 
  leftHolobot: initialLeftHolobot,
  rightHolobot: initialRightHolobot,
  isCpuBattle = false,
  cpuLevel = 1,
  onBattleEnd 
}: BattleSceneProps) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { getEquippedParts } = useHolobotPartsStore();
  const { getHolobotAttributeLevel } = useSyncPointsStore();
  const [leftHealth, setLeftHealth] = useState(100);
  const [rightHealth, setRightHealth] = useState(100);
  const [leftSpecial, setLeftSpecial] = useState(0);
  const [rightSpecial, setRightSpecial] = useState(0);
  const [leftHack, setLeftHack] = useState(0);
  const [rightHack, setRightHack] = useState(0);
  const [leftIsAttacking, setLeftIsAttacking] = useState(false);
  const [rightIsAttacking, setRightIsAttacking] = useState(false);
  const [leftIsDamaged, setLeftIsDamaged] = useState(false);
  const [rightIsDamaged, setRightIsDamaged] = useState(false);
  const [selectedLeftHolobot, setSelectedLeftHolobot] = useState(initialLeftHolobot);
  const [selectedRightHolobot, setSelectedRightHolobot] = useState(initialRightHolobot);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [leftComboChain, setLeftComboChain] = useState(0);
  const [rightComboChain, setRightComboChain] = useState(0);
  const [holosHackCount, setHolosHackCount] = useState(0);
  const [isHolosHackModalOpen, setIsHolosHackModalOpen] = useState(false);
  
  const [displayLeftXp, setDisplayLeftXp] = useState(0);
  const [displayRightXp, setRightXp] = useState(0);
  
  const [leftXp, setLeftXp] = useState(0);
  const [leftLevel, setLeftLevel] = useState(() => {
    if (user?.holobots) {
      const userHolobot = user.holobots.find(h => 
        h.name.toLowerCase() === HOLOBOT_STATS[initialLeftHolobot]?.name.toLowerCase()
      );
      return userHolobot?.level || 1;
    }
    return 1;
  });
  const [rightLevel, setRightLevel] = useState(cpuLevel);
  const [leftFatigue, setLeftFatigue] = useState(0);
  const [rightFatigue, setRightFatigue] = useState(0);
  const [isDefenseMode, setIsDefenseMode] = useState(false);
  const [defenseModeRounds, setDefenseModeRounds] = useState(0);

  const [leftStats, setLeftStats] = useState(() => {
    const base = HOLOBOT_STATS[selectedLeftHolobot];
    return { 
      ...defaultBattleStats, // Start with defaults
      ...(base || {}), // Spread actual stats if they exist
      level: leftLevel, // Override level
      maxHealth: base?.maxHealth || defaultBattleStats.maxHealth // Ensure maxHealth
    };
  });
  const [rightStats, setRightStats] = useState(() => {
    const base = HOLOBOT_STATS[selectedRightHolobot];
    return { 
      ...defaultBattleStats,
      ...(base || {}),
      level: cpuLevel,
      maxHealth: base?.maxHealth || defaultBattleStats.maxHealth
    };
  });

  useEffect(() => {
    setSelectedLeftHolobot(initialLeftHolobot);
    if (user?.holobots) {
      const userHolobot = user.holobots.find(h => 
        h.name.toLowerCase() === HOLOBOT_STATS[initialLeftHolobot]?.name.toLowerCase()
      );
      setLeftLevel(userHolobot?.level || 1);
    } else {
      setLeftLevel(1);
    }
  }, [initialLeftHolobot, user]);

  useEffect(() => {
    setSelectedRightHolobot(initialRightHolobot);
    setRightLevel(cpuLevel);
  }, [initialRightHolobot, cpuLevel]);

  useEffect(() => {
    const baseStats = HOLOBOT_STATS[selectedLeftHolobot];
    if (!baseStats) return;

    const leftUserHolobot = user?.holobots?.find(h => 
      h.name.toLowerCase() === baseStats.name.toLowerCase()
    );

    // Get equipped parts for this holobot
    const equippedParts = getEquippedParts(baseStats.name);

    // Start with base stats and apply boosts manually
    let completeStats = { 
      ...defaultBattleStats,
      ...baseStats,
      level: leftUserHolobot?.level || baseStats.level || 1,
      maxHealth: baseStats.maxHealth || defaultBattleStats.maxHealth
    };

    // Apply attribute boosts from leveling up
    if (leftUserHolobot?.boostedAttributes) {
      completeStats.attack += leftUserHolobot.boostedAttributes.attack || 0;
      completeStats.defense += leftUserHolobot.boostedAttributes.defense || 0;
      completeStats.speed += leftUserHolobot.boostedAttributes.speed || 0;
      completeStats.maxHealth += leftUserHolobot.boostedAttributes.health || 0;
    }

    // Apply parts bonuses
    if (equippedParts) {
      Object.values(equippedParts).forEach((part: any) => {
        if (part?.baseStats) {
          completeStats.attack += part.baseStats.attack || 0;
          completeStats.defense += part.baseStats.defense || 0;
          completeStats.speed += part.baseStats.speed || 0;
          completeStats.intelligence = (completeStats.intelligence || 0) + (part.baseStats.intelligence || 0);
        }
      });
    }

    // Apply SP upgrade bonuses (2 points per level)
    const holobotId = leftUserHolobot?.name || baseStats.name;
    const spBonuses = {
      attack: getHolobotAttributeLevel(holobotId, 'attack') * 2,
      defense: getHolobotAttributeLevel(holobotId, 'defense') * 2,
      speed: getHolobotAttributeLevel(holobotId, 'speed') * 2,
      hp: getHolobotAttributeLevel(holobotId, 'hp') * 2,
    };
    
    completeStats.attack += spBonuses.attack;
    completeStats.defense += spBonuses.defense;
    completeStats.speed += spBonuses.speed;
    completeStats.maxHealth += spBonuses.hp;

    console.log("Battle stats for", baseStats.name, "including parts and SP:", completeStats);

    setLeftStats(completeStats);
    setLeftHealth(completeStats.maxHealth);
  }, [selectedLeftHolobot, leftLevel, user, getEquippedParts]);
  
  useEffect(() => {
    const baseStats = HOLOBOT_STATS[selectedRightHolobot];
    const initialRightStats = {
        ...defaultBattleStats,
        ...(baseStats || {}),
        level: rightLevel, // This is the tier-based level from cpuLevel prop
        maxHealth: baseStats?.maxHealth || defaultBattleStats.maxHealth
    };

    // Apply randomized attribute upgrades based on tier level
    let upgradesToApply = 0;
    if (initialRightStats.level === 5) { // Tier 1
      upgradesToApply = 5;
    } else if (initialRightStats.level === 20) { // Tier 2
      upgradesToApply = 20;
    } else if (initialRightStats.level === 40) { // Tier 3
      upgradesToApply = 40;
    }

    const attributes: Array<keyof typeof initialRightStats> = ['attack', 'defense', 'speed'];
    const boostedStats = { ...initialRightStats };

    for (let i = 0; i < upgradesToApply; i++) {
      const randomAttribute = attributes[Math.floor(Math.random() * attributes.length)];
      if (typeof boostedStats[randomAttribute] === 'number') {
        (boostedStats[randomAttribute] as number) += 1;
      }
    }
    
    // Log the boosted stats for verification
    if (upgradesToApply > 0) {
        console.log(`Applied ${upgradesToApply} upgrades to opponent ${selectedRightHolobot} (Lvl ${initialRightStats.level}). New Stats:`, boostedStats);
    }

    setRightStats(boostedStats);
    setRightHealth(boostedStats.maxHealth); // Reset health based on maxHealth (which isn't changed by these upgrades)
  }, [selectedRightHolobot, rightLevel]);

  useEffect(() => {
    const currentLeftMaxHealth = leftStats.maxHealth || 100;
    const currentRightMaxHealth = rightStats.maxHealth || 100;

    setLeftHealth(currentLeftMaxHealth);
    setRightHealth(currentRightMaxHealth);
    setLeftSpecial(0);
    setRightSpecial(0);
    setLeftHack(0);
    setLeftFatigue(0);
    setRightFatigue(0);
    setLeftComboChain(0);
    setRightComboChain(0);
    
    if (isBattleStarted && battleLog.length > 0 && battleLog[battleLog.length -1] !== `New Round! Facing ${rightStats.name || 'Unknown Opponent'}`) {
        if (initialRightHolobot === selectedRightHolobot) {
             addToBattleLog(`New Round! Facing ${rightStats.name || 'Unknown Opponent'}`);
        }
    } else if (!isBattleStarted && battleLog.length === 0) {
        setBattleLog(["Battle ready!"]);
    }

    setLeftIsAttacking(false);
    setRightIsAttacking(false);
    setLeftIsDamaged(false);
    setRightIsDamaged(false);
    setIsDefenseMode(false);
    setDefenseModeRounds(0);
    setHolosHackCount(0);

  }, [selectedRightHolobot, isBattleStarted, initialRightHolobot]);

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const handleHypeUp = () => {
    if (isBattleStarted) {
      setLeftSpecial(prev => Math.min(100, prev + 20));
      addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} is getting hyped up!`);
    }
  };

  const handleHack = (type: 'attack' | 'speed' | 'heal') => {
    // Determine hack tier based on current gauge
    const isFullPower = leftHack >= 100;
    const isWeakPower = leftHack >= 50 && leftHack < 100;
    const canHeal = leftHack >= 75;
    
    if (type === 'heal' && !canHeal) return; // Heal requires 75%+
    if ((type === 'attack' || type === 'speed') && leftHack < 50) return; // Attack/Speed require 50%+

    const currentStats = leftStats;
    let newStats = { ...currentStats };
    let hackCost = 0;
    let logMessage = '';

    switch (type) {
      case 'attack':
        if (isFullPower) {
          // Strong boost: +30% attack
          newStats.attack = Math.floor(currentStats.attack * 1.3);
          hackCost = 100;
          logMessage = `${leftStats.name} used STRONG hack boost! Attack greatly increased!`;
        } else if (isWeakPower) {
          // Weak boost: +15% attack
          newStats.attack = Math.floor(currentStats.attack * 1.15);
          hackCost = leftHack; // Consume all available
          logMessage = `${leftStats.name} used weak hack boost! Attack slightly increased!`;
        }
        break;
        
      case 'speed':
        if (isFullPower) {
          // Strong boost: +30% speed
          newStats.speed = Math.floor(currentStats.speed * 1.3);
          hackCost = 100;
          logMessage = `${leftStats.name} used STRONG hack boost! Speed greatly increased!`;
        } else if (isWeakPower) {
          // Weak boost: +15% speed
          newStats.speed = Math.floor(currentStats.speed * 1.15);
          hackCost = leftHack; // Consume all available
          logMessage = `${leftStats.name} used weak hack boost! Speed slightly increased!`;
        }
        break;
        
      case 'heal':
        if (isFullPower) {
          // Large heal: 50% of max health
          const healAmount = Math.floor(currentStats.maxHealth * 0.5);
          setLeftHealth(prev => Math.min(currentStats.maxHealth, prev + healAmount));
          hackCost = 100;
          logMessage = `${leftStats.name} used STRONG hack heal! Large amount of health restored!`;
        } else if (canHeal) {
          // Small heal: 25% of max health
          const healAmount = Math.floor(currentStats.maxHealth * 0.25);
          setLeftHealth(prev => Math.min(currentStats.maxHealth, prev + healAmount));
          hackCost = 75;
          logMessage = `${leftStats.name} used weak hack heal! Small amount of health restored!`;
        }
        break;
    }

    // Apply stat changes for attack/speed
    if (type === 'attack' || type === 'speed') {
      setLeftStats({ 
        ...defaultBattleStats,
        ...newStats,
        level: currentStats.level,
        maxHealth: currentStats.maxHealth
      });
    }

    // Consume hack gauge
    setLeftHack(prev => Math.max(0, prev - hackCost));
    addToBattleLog(logMessage);
  };

  const handleHolosHack = () => {
    if (user && user.holosTokens >= 100 && holosHackCount < 3) {
      setIsHolosHackModalOpen(true);
    }
  };

  const handleHolosHackSelect = (type: 'special' | 'heal' | 'attack' | 'defense' | 'speed') => {
    if (!user || user.holosTokens < 100 || holosHackCount >= 3) return;
    updateUser({ holosTokens: user.holosTokens - 100 });
    setHolosHackCount(prev => prev + 1);
    setIsHolosHackModalOpen(false);
    switch(type) {
      case 'special':
        setLeftSpecial(100);
        addToBattleLog(`${leftStats.name}'s special attack gauge is fully charged!`);
        break;
      case 'heal':
        setLeftHealth(prev => Math.min(leftStats.maxHealth, prev + Math.floor(leftStats.maxHealth * 0.4)));
        addToBattleLog(`${leftStats.name} regains health!`);
        break;
      case 'attack':
        setLeftStats(prev => ({ 
            ...defaultBattleStats,
            ...prev, 
            attack: (prev.attack || defaultBattleStats.attack) + 20, 
            level: prev.level || defaultBattleStats.level, 
            maxHealth: prev.maxHealth || defaultBattleStats.maxHealth
        }));
        addToBattleLog(`${leftStats.name}'s attack is boosted!`);
        break;
      case 'defense':
        setLeftStats(prev => ({ 
            ...defaultBattleStats,
            ...prev, 
            defense: (prev.defense || defaultBattleStats.defense) + Math.floor((prev.defense || defaultBattleStats.defense) * 0.3), 
            level: prev.level || defaultBattleStats.level,
            maxHealth: prev.maxHealth || defaultBattleStats.maxHealth
        }));
        addToBattleLog(`${leftStats.name}'s defense is boosted!`);
        break;
      case 'speed':
        setLeftStats(prev => ({ 
            ...defaultBattleStats,
            ...prev, 
            speed: (prev.speed || defaultBattleStats.speed) + Math.floor((prev.speed || defaultBattleStats.speed) * 0.3), 
            level: prev.level || defaultBattleStats.level,
            maxHealth: prev.maxHealth || defaultBattleStats.maxHealth
        }));
        addToBattleLog(`${leftStats.name}'s speed is boosted!`);
        break;
    }
  };

  const handleStartBattle = () => {
    if (isBattleStarted) {
      setIsBattleStarted(false);
      setLeftHealth(leftStats.maxHealth || 100);
      setRightHealth(rightStats.maxHealth || 100);
      setLeftSpecial(0);
      setRightSpecial(0);
      setLeftHack(0);
      setRightHack(0);
      setLeftComboChain(0);
      setRightComboChain(0);
      setBattleLog(["Ready for a new battle!"]);
      onBattleEnd?.('defeat');
      return;
    }
    
    setIsBattleStarted(true);
    setLeftHealth(leftStats.maxHealth || 100);
    setRightHealth(rightStats.maxHealth || 100);
    setLeftSpecial(0);
    setRightSpecial(0);
    setLeftHack(0);
    setRightHack(0);
    setLeftComboChain(0);
    setRightComboChain(0);
    
    setDisplayLeftXp(leftXp);
    
    setBattleLog(["Battle started!"]);
  };

  const handleModeChange = (isDefense: boolean) => {
    if (isBattleStarted) {
      setIsDefenseMode(isDefense);
      if (isDefense) {
        setDefenseModeRounds(0);
        addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} switched to Defense Mode!`);
      } else {
        addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} switched to Attack Mode!`);
      }
    }
  };

  const saveBattleResults = async (winner: string) => {
    try {
      if (!user) return;

      if (winner === selectedLeftHolobot) {
        const totalDamage = (rightStats.maxHealth || 100) - rightHealth;
        const battleXp = Math.floor(totalDamage * 2);
        const newTotalXp = leftXp + battleXp;
        const newLevel = getNewLevel(newTotalXp, leftLevel);
        
        const updatedHolobots = updateHolobotExperience(
          user.holobots,
          HOLOBOT_STATS[selectedLeftHolobot].name,
          newTotalXp,
          newLevel
        );
        
        console.log("Updating user holobots with:", updatedHolobots);
        
        await updateUser({ 
          holobots: updatedHolobots,
          stats: {
            wins: (user.stats?.wins || 0) + 1,
            losses: user.stats?.losses || 0
          }
        });
        
        if (newLevel > leftLevel) {
          toast({
            title: "Level Up!",
            description: `${HOLOBOT_STATS[selectedLeftHolobot].name} is now level ${newLevel}!`,
          });
        } else {
          toast({
            title: "Battle Progress Saved",
            description: `${HOLOBOT_STATS[selectedLeftHolobot].name} gained ${battleXp} XP!`,
          });
        }
      } else {
        await updateUser({ 
          stats: {
            wins: user.stats?.wins || 0,
            losses: (user.stats?.losses || 0) + 1
          }
        });
      }
    } catch (error) {
      console.error("Error saving battle results:", error);
      toast({
        title: "Error",
        description: "Failed to save battle progress",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!isBattleStarted) return;

    const interval = setInterval(() => {
      if (leftHealth <= 0 || rightHealth <= 0) {
        setIsBattleStarted(false);
        const winnerIsLeft = leftHealth > 0;
        const winnerName = winnerIsLeft ? leftStats.name : rightStats.name;
        const loserName = winnerIsLeft ? rightStats.name : leftStats.name;
        
        const finalLeftStats = {
            ...defaultBattleStats,
            ...leftStats,
            level: leftStats.level || defaultBattleStats.level, // Ensure level is defined
            maxHealth: leftStats.maxHealth || defaultBattleStats.maxHealth, // Ensure maxHealth is defined
            intelligence: Math.min(10, (leftStats.intelligence || defaultBattleStats.intelligence) + (winnerIsLeft ? 1 : -1))
        };
        const finalRightStats = {
            ...defaultBattleStats,
            ...rightStats,
            level: rightStats.level || defaultBattleStats.level, // Ensure level is defined
            maxHealth: rightStats.maxHealth || defaultBattleStats.maxHealth, // Ensure maxHealth is defined
            intelligence: Math.min(10, (rightStats.intelligence || defaultBattleStats.intelligence) + (winnerIsLeft ? -1 : 1))
        };

        setLeftStats(finalLeftStats);
        setRightStats(finalRightStats);
        
        onBattleEnd?.(winnerIsLeft ? 'victory' : 'defeat');
        saveBattleResults(winnerIsLeft ? selectedLeftHolobot : selectedRightHolobot);
        
        setLeftComboChain(0);
        setRightComboChain(0);
        
        addToBattleLog(`Battle ended! ${winnerName} is victorious!`);
        addToBattleLog(`${winnerName}'s intelligence increased! ${loserName}'s intelligence decreased!`);
        clearInterval(interval);
        return;
      }

      if (isDefenseMode) {
        const maxDefenseRounds = leftStats.intelligence >= 7 ? 3 : 2;
        setDefenseModeRounds(prev => {
          if (prev >= maxDefenseRounds) {
            setIsDefenseMode(false);
            addToBattleLog(`${leftStats.name} automatically switched to Attack Mode!`);
            return 0;
          }
          return prev + 1;
        });
      }

      const attacker = Math.random() > 0.5;
      
      if (attacker) {
        setLeftIsAttacking(true);
        
        const tempLeftStats = {...leftStats};
        tempLeftStats.fatigue = leftFatigue;
        
        let damage = calculateDamage(
          tempLeftStats,
          rightStats
        );

        if (isDefenseMode) {
          damage *= 0.5;
          setLeftSpecial(prev => Math.min(100, prev + 15));
          setLeftHack(prev => Math.min(100, prev + 10));
        } else {
          const intMultiplier = 1 + (leftStats.intelligence * 0.1);
          damage *= intMultiplier;
        }
        
        const maxCombo = leftStats.intelligence > 5 ? 8 : 5;
        if (leftComboChain > 0) {
          const comboMultiplier = 1 + (leftComboChain * 0.15);
          damage = Math.floor(damage * comboMultiplier);
          addToBattleLog(`Combo x${leftComboChain}! Damage boosted to ${damage}!`);
        }
        
        setTimeout(() => {
          if (damage > 0) {
            setRightIsDamaged(true);
            setRightHealth(prev => Math.max(0, prev - damage));
            setLeftSpecial(prev => Math.min(100, prev + 10));
            setLeftHack(prev => Math.min(100, prev + 5));
            
            setLeftComboChain(prev => {
              if (prev > maxCombo) {
                addToBattleLog(`${leftStats.name}'s combo chain reset!`);
                return 0;
              }
              return prev + 1;
            });
            
            if (leftSpecial >= 100) {
              const currentLeftStats = leftStats;
              const boostedStats = applySpecialAttack(currentLeftStats);
              setLeftStats({
                  ...defaultBattleStats,
                  ...boostedStats, 
                  level: currentLeftStats.level, 
                  maxHealth: currentLeftStats.maxHealth // Or boostedStats.maxHealth if special can change it
              });
              setLeftSpecial(0);
              addToBattleLog(`${leftStats.name} used their special move!`);
            }
            
            addToBattleLog(`${leftStats.name} attacks for ${damage} damage!`);
          } else {
            if (leftComboChain > 0) {
              addToBattleLog(`${leftStats.name}'s combo chain broken!`);
              setLeftComboChain(0);
            }
            addToBattleLog(`${rightStats.name} evaded the attack!`);
          }
          
          setLeftFatigue(prev => prev + (prev > 2 ? 1 : 0));
          
          setTimeout(() => {
            setRightIsDamaged(false);
            setLeftIsAttacking(false);
          }, 100);
        }, 250);
      } else {
        setRightIsAttacking(true);
        
        let damage = calculateDamage(
          { ...rightStats, fatigue: rightFatigue },
          leftStats
        );
        
        const maxRightCombo = rightStats.intelligence > 5 ? 8 : 5;
        if (rightComboChain > 0) {
          const comboMultiplier = 1 + (rightComboChain * 0.15);
          damage = Math.floor(damage * comboMultiplier);
          addToBattleLog(`Enemy Combo x${rightComboChain}! Damage boosted to ${damage}!`);
        }
        
        setTimeout(() => {
          if (damage > 0) {
            setLeftIsDamaged(true);
            setLeftHealth(prev => Math.max(0, prev - damage));
            setRightSpecial(prev => Math.min(100, prev + 10));
            setRightHack(prev => Math.min(100, prev + 5));
            
            setRightComboChain(prev => {
              const newCombo = prev + 1;
              if (newCombo > maxRightCombo) {
                addToBattleLog(`${rightStats.name}'s combo chain reset!`);
                return 0;
              }
              return newCombo;
            });
            
            if (rightSpecial >= 100) {
              const currentRightStats = rightStats;
              const boostedStats = applySpecialAttack(currentRightStats);
              setRightStats({
                  ...defaultBattleStats,
                  ...boostedStats, 
                  level: currentRightStats.level, 
                  maxHealth: currentRightStats.maxHealth // Or boostedStats.maxHealth
              });
              setRightSpecial(0);
              addToBattleLog(`${rightStats.name} used their special move!`);
            }
            
            addToBattleLog(`${rightStats.name} attacks for ${damage} damage!`);
          } else {
            if (rightComboChain > 0) {
              addToBattleLog(`${rightStats.name}'s combo chain broken!`);
              setRightComboChain(0);
            }
            addToBattleLog(`${leftStats.name} evaded the attack!`);
          }
          
          setRightFatigue(prev => prev + (prev > 2 ? 1 : 0));
          
          setTimeout(() => {
            setLeftIsDamaged(false);
            setRightIsAttacking(false);
          }, 100);
        }, 250);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBattleStarted, selectedLeftHolobot, selectedRightHolobot, leftLevel, rightLevel, leftFatigue, rightFatigue, leftHealth, rightHealth, isDefenseMode, leftXp, displayLeftXp, leftComboChain, rightComboChain, leftStats, rightStats]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 mb-1 bg-holobots-card p-2 md:p-4 rounded-lg border border-holobots-border shadow-neon">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <BattleControls
            onStartBattle={handleStartBattle}
            onHypeUp={handleHypeUp}
            onHack={handleHack}
            onHolosHack={handleHolosHack}
            isBattleStarted={isBattleStarted}
            hackGauge={leftHack}
            holosHackCount={holosHackCount}
            playerHolos={user?.holosTokens || 0}
          />
          <ModeSlider 
            isDefense={isDefenseMode}
            onModeChange={handleModeChange}
            disabled={!isBattleStarted}
          />
        </div>
        
        {!isCpuBattle && (
          <BattleSelectors
            selectedLeftHolobot={selectedLeftHolobot}
            selectedRightHolobot={selectedRightHolobot}
            onLeftSelect={setSelectedLeftHolobot}
            onRightSelect={setSelectedRightHolobot}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <BattleCards
          selectedLeftHolobot={selectedLeftHolobot}
          selectedRightHolobot={selectedRightHolobot}
          leftLevel={leftLevel}
          rightLevel={rightLevel}
          leftXp={displayLeftXp}
          rightXp={displayRightXp}
          leftStats={leftStats}
          rightStats={rightStats}
        />
        
        <div className="relative w-full max-w-3xl mx-auto h-20 md:h-32 bg-cyberpunk-background rounded-lg overflow-hidden border-2 border-cyberpunk-border shadow-neon">
          <div className="absolute inset-0 bg-gradient-to-t from-cyberpunk-background to-cyberpunk-primary/5" />
          
          <div className="relative z-10 w-full h-full p-2 md:p-4 flex flex-col">
            <BattleMeters
              leftHealth={leftHealth}
              rightHealth={rightHealth}
              leftMaxHealth={leftStats.maxHealth || 100}
              rightMaxHealth={rightStats.maxHealth || 100}
              leftSpecial={leftSpecial}
              rightSpecial={rightSpecial}
              leftHack={leftHack}
              rightHack={rightHack}
            />

            <BattleCharacters
              leftIsDamaged={leftIsDamaged}
              rightIsDamaged={rightIsDamaged}
              leftIsAttacking={leftIsAttacking}
              rightIsAttacking={rightIsAttacking}
            />
          </div>
        </div>

        <BattleLog logs={battleLog} />
      </div>

      {/* Holos Hack Modal */}
      <Dialog open={isHolosHackModalOpen} onOpenChange={setIsHolosHackModalOpen}>
        <DialogContent className="max-w-xs p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              className="bg-purple-600 text-white rounded p-2 text-xs font-bold hover:bg-purple-700"
              onClick={() => handleHolosHackSelect('special')}
            >
              Special Attack
            </button>
            <button
              className="bg-green-600 text-white rounded p-2 text-xs font-bold hover:bg-green-700"
              onClick={() => handleHolosHackSelect('heal')}
            >
              Health Regain
            </button>
            <button
              className="bg-red-600 text-white rounded p-2 text-xs font-bold hover:bg-red-700"
              onClick={() => handleHolosHackSelect('attack')}
            >
              Boost Attack
            </button>
            <button
              className="bg-blue-600 text-white rounded p-2 text-xs font-bold hover:bg-blue-700"
              onClick={() => handleHolosHackSelect('defense')}
            >
              Boost Defense
            </button>
            <button
              className="bg-yellow-500 text-white rounded p-2 text-xs font-bold hover:bg-yellow-600 col-span-2"
              onClick={() => handleHolosHackSelect('speed')}
            >
              Boost Speed
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
