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
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

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
  
  const [displayLeftXp, setDisplayLeftXp] = useState(0);
  const [displayRightXp, setRightXp] = useState(0);
  
  const [pendingXpGained, setPendingXpGained] = useState(0);
  
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

  useEffect(() => {
    if (user?.holobots) {
      const userHolobot = user.holobots.find(h => 
        h.name.toLowerCase() === HOLOBOT_STATS[selectedLeftHolobot]?.name.toLowerCase()
      );
      
      if (userHolobot) {
        setLeftXp(userHolobot.experience || 0);
        setDisplayLeftXp(userHolobot.experience || 0);
        setLeftLevel(userHolobot.level || 1);
        
        if (userHolobot.boostedAttributes) {
          console.log("Applying attribute boosts for battle:", userHolobot.boostedAttributes);
          
          const tempLeftStats = {...HOLOBOT_STATS[selectedLeftHolobot]};
          
          if (userHolobot.boostedAttributes.attack) {
            tempLeftStats.attack += userHolobot.boostedAttributes.attack;
          }
          if (userHolobot.boostedAttributes.defense) {
            tempLeftStats.defense += userHolobot.boostedAttributes.defense;
          }
          if (userHolobot.boostedAttributes.speed) {
            tempLeftStats.speed += userHolobot.boostedAttributes.speed;
          }
          if (userHolobot.boostedAttributes.health) {
            tempLeftStats.maxHealth += userHolobot.boostedAttributes.health;
          }
          
          HOLOBOT_STATS[selectedLeftHolobot] = tempLeftStats;
        }
      }
    }
  }, [user, selectedLeftHolobot]);

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
    if (leftHack >= 100) {
      const updatedStats = applyHackBoost(HOLOBOT_STATS[selectedLeftHolobot], type);
      HOLOBOT_STATS[selectedLeftHolobot] = updatedStats;
      setLeftHack(0);
      addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} used hack: ${type}!`);
    }
  };

  const handleStartBattle = () => {
    if (isBattleStarted) {
      setIsBattleStarted(false);
      setLeftHealth(100);
      setRightHealth(100);
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
    setLeftHealth(100);
    setRightHealth(100);
    setLeftSpecial(0);
    setRightSpecial(0);
    setLeftHack(0);
    setRightHack(0);
    setLeftComboChain(0);
    setRightComboChain(0);
    
    setPendingXpGained(0);
    
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
        const newTotalXp = leftXp + pendingXpGained;
        const newLevel = getNewLevel(newTotalXp, leftLevel);
        
        if (newLevel > leftLevel) {
          addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} reached level ${newLevel}!`);
        }
        
        const updatedHolobots = updateHolobotExperience(
          user.holobots,
          HOLOBOT_STATS[selectedLeftHolobot].name,
          pendingXpGained,
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
            description: `${HOLOBOT_STATS[selectedLeftHolobot].name} gained ${pendingXpGained} XP!`,
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
        const winner = leftHealth > 0 ? selectedLeftHolobot : selectedRightHolobot;
        const winnerName = HOLOBOT_STATS[winner].name;
        const loser = leftHealth > 0 ? selectedRightHolobot : selectedLeftHolobot;
        const loserName = HOLOBOT_STATS[loser].name;
        
        if (leftHealth > 0) {
          HOLOBOT_STATS[selectedLeftHolobot].intelligence = Math.min(10, HOLOBOT_STATS[selectedLeftHolobot].intelligence + 1);
          HOLOBOT_STATS[selectedRightHolobot].intelligence = Math.max(1, HOLOBOT_STATS[selectedRightHolobot].intelligence - 1);
          onBattleEnd?.('victory');
          saveBattleResults(selectedLeftHolobot);
        } else {
          HOLOBOT_STATS[selectedLeftHolobot].intelligence = Math.max(1, HOLOBOT_STATS[selectedLeftHolobot].intelligence - 1);
          HOLOBOT_STATS[selectedRightHolobot].intelligence = Math.min(10, HOLOBOT_STATS[selectedRightHolobot].intelligence + 1);
          onBattleEnd?.('defeat');
          saveBattleResults(selectedRightHolobot);
        }
        
        setLeftComboChain(0);
        setRightComboChain(0);
        
        addToBattleLog(`Battle ended! ${winnerName} is victorious!`);
        addToBattleLog(`${winnerName}'s intelligence increased! ${loserName}'s intelligence decreased!`);
        clearInterval(interval);
        return;
      }

      if (isDefenseMode) {
        const maxDefenseRounds = HOLOBOT_STATS[selectedLeftHolobot].intelligence >= 7 ? 3 : 2;
        setDefenseModeRounds(prev => {
          if (prev >= maxDefenseRounds) {
            setIsDefenseMode(false);
            addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} automatically switched to Attack Mode!`);
            return 0;
          }
          return prev + 1;
        });
      }

      const attacker = Math.random() > 0.5;
      
      if (attacker) {
        setLeftIsAttacking(true);
        
        const leftHolobotStats = {...HOLOBOT_STATS[selectedLeftHolobot]};
        leftHolobotStats.fatigue = leftFatigue;
        
        let damage = calculateDamage(
          leftHolobotStats,
          HOLOBOT_STATS[selectedRightHolobot]
        );

        if (isDefenseMode) {
          damage *= 0.5;
          setLeftSpecial(prev => Math.min(100, prev + 15));
          setLeftHack(prev => Math.min(100, prev + 10));
        } else {
          const intMultiplier = 1 + (HOLOBOT_STATS[selectedLeftHolobot].intelligence * 0.1);
          damage *= intMultiplier;
        }
        
        const maxCombo = HOLOBOT_STATS[selectedLeftHolobot].intelligence > 5 ? 8 : 5;
        if (leftComboChain > 0) {
          const comboMultiplier = 1 + (leftComboChain * 0.15);
          damage = Math.floor(damage * comboMultiplier);
          addToBattleLog(`Combo x${leftComboChain}! Damage boosted to ${damage}!`);
        }
        
        setTimeout(() => {
          if (damage > 0) {
            setRightIsDamaged(true);
            const healthReduction = (damage / HOLOBOT_STATS[selectedRightHolobot].maxHealth) * 100;
            setRightHealth(prev => Math.max(0, prev - healthReduction));
            setLeftSpecial(prev => Math.min(100, prev + 10));
            setLeftHack(prev => Math.min(100, prev + 5));
            
            setLeftComboChain(prev => {
              if (prev > maxCombo) {
                addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name}'s combo chain reset!`);
                return 0;
              }
              return prev + 1;
            });
            
            if (leftSpecial >= 100) {
              const boostedStats = applySpecialAttack(HOLOBOT_STATS[selectedLeftHolobot]);
              HOLOBOT_STATS[selectedLeftHolobot] = boostedStats;
              setLeftSpecial(0);
              addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} used their special move!`);
            }
            
            const damageXp = Math.floor(damage * 2);
            setPendingXpGained(prev => prev + damageXp);
            setDisplayLeftXp(leftXp + pendingXpGained + damageXp);
            
            addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} attacks for ${Math.floor(damage)} damage!`);
          } else {
            if (leftComboChain > 0) {
              addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name}'s combo chain broken!`);
              setLeftComboChain(0);
            }
            addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} evaded the attack!`);
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
          { ...HOLOBOT_STATS[selectedRightHolobot], fatigue: rightFatigue },
          HOLOBOT_STATS[selectedLeftHolobot]
        );
        
        const maxRightCombo = HOLOBOT_STATS[selectedRightHolobot].intelligence > 5 ? 8 : 5;
        if (rightComboChain > 0) {
          const comboMultiplier = 1 + (rightComboChain * 0.15);
          damage = Math.floor(damage * comboMultiplier);
          addToBattleLog(`Enemy Combo x${rightComboChain}! Damage boosted to ${damage}!`);
        }
        
        setTimeout(() => {
          if (damage > 0) {
            setLeftIsDamaged(true);
            const healthReduction = (damage / HOLOBOT_STATS[selectedLeftHolobot].maxHealth) * 100;
            setLeftHealth(prev => Math.max(0, prev - healthReduction));
            setRightSpecial(prev => Math.min(100, prev + 10));
            setRightHack(prev => Math.min(100, prev + 5));
            
            setRightComboChain(prev => {
              const newCombo = prev + 1;
              if (newCombo > maxRightCombo) {
                addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name}'s combo chain reset!`);
                return 0;
              }
              return newCombo;
            });
            
            if (rightSpecial >= 100) {
              const boostedStats = applySpecialAttack(HOLOBOT_STATS[selectedRightHolobot]);
              HOLOBOT_STATS[selectedRightHolobot] = boostedStats;
              setRightSpecial(0);
              addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} used their special move!`);
            }
            
            setRightXp(prev => {
              const newXp = prev + Math.floor(damage * 2);
              const newLevel = getNewLevel(newXp, rightLevel);
              if (newLevel > rightLevel) {
                setRightLevel(newLevel);
                addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} reached level ${newLevel}!`);
              }
              return newXp;
            });
            
            addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} attacks for ${Math.floor(damage)} damage!`);
          } else {
            if (rightComboChain > 0) {
              addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name}'s combo chain broken!`);
              setRightComboChain(0);
            }
            addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} evaded the attack!`);
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
  }, [isBattleStarted, selectedLeftHolobot, selectedRightHolobot, leftLevel, rightLevel, leftFatigue, rightFatigue, leftHealth, rightHealth, isDefenseMode, leftXp, pendingXpGained, displayLeftXp, leftComboChain, rightComboChain]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 mb-1 bg-holobots-card p-2 md:p-4 rounded-lg border border-holobots-border shadow-neon">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <BattleControls
            onStartBattle={handleStartBattle}
            onHypeUp={handleHypeUp}
            onHack={handleHack}
            isBattleStarted={isBattleStarted}
            hackGauge={leftHack}
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
        />
        
        <div className="relative w-full max-w-3xl mx-auto h-20 md:h-32 bg-cyberpunk-background rounded-lg overflow-hidden border-2 border-cyberpunk-border shadow-neon">
          <div className="absolute inset-0 bg-gradient-to-t from-cyberpunk-background to-cyberpunk-primary/5" />
          
          <div className="relative z-10 w-full h-full p-2 md:p-4 flex flex-col">
            <BattleMeters
              leftHealth={leftHealth}
              rightHealth={rightHealth}
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
    </div>
  );
};
