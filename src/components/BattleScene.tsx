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
import { Dialog, DialogContent } from "./ui/dialog";

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
  const [rightLevel, setRightLevel] = useState(1);
  const [leftFatigue, setLeftFatigue] = useState(0);
  const [rightFatigue, setRightFatigue] = useState(0);
  const [isDefenseMode, setIsDefenseMode] = useState(false);
  const [defenseModeRounds, setDefenseModeRounds] = useState(0);

  const [leftStats, setLeftStats] = useState(() => ({...HOLOBOT_STATS[selectedLeftHolobot]}));
  const [rightStats, setRightStats] = useState(() => ({...HOLOBOT_STATS[selectedRightHolobot]}));

  useEffect(() => {
    if (user && user.holobots && Array.isArray(user.holobots)) {
      const leftUserHolobot = user.holobots.find(h => 
        h.name.toLowerCase() === HOLOBOT_STATS[selectedLeftHolobot]?.name.toLowerCase()
      );
      
      if (leftUserHolobot && leftUserHolobot.boostedAttributes) {
        console.log("Applying attribute boosts for battle:", leftUserHolobot.boostedAttributes);
        
        const tempLeftStats = {...HOLOBOT_STATS[selectedLeftHolobot]};
        
        if (leftUserHolobot.boostedAttributes.attack) {
          tempLeftStats.attack += leftUserHolobot.boostedAttributes.attack;
        }
        if (leftUserHolobot.boostedAttributes.defense) {
          tempLeftStats.defense += leftUserHolobot.boostedAttributes.defense;
        }
        if (leftUserHolobot.boostedAttributes.speed) {
          tempLeftStats.speed += leftUserHolobot.boostedAttributes.speed;
        }
        if (leftUserHolobot.boostedAttributes.health) {
          tempLeftStats.maxHealth += leftUserHolobot.boostedAttributes.health;
        }
        
        setLeftStats(tempLeftStats);
      }
    }
  }, [user, selectedLeftHolobot]);

  useEffect(() => {
    if (user?.holobots) {
      const userHolobot = user.holobots.find(h => 
        h.name.toLowerCase() === HOLOBOT_STATS[selectedLeftHolobot]?.name.toLowerCase()
      );
      if (userHolobot?.level) {
        setLeftLevel(userHolobot.level);
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
      const updatedStats = applyHackBoost(leftStats, type);
      setLeftStats(updatedStats);
      setLeftHack(0);
      addToBattleLog(`${leftStats.name} used hack: ${type}!`);
    }
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
        setLeftStats(prev => ({ ...prev, attack: prev.attack + 20 }));
        addToBattleLog(`${leftStats.name}'s attack is boosted!`);
        break;
      case 'defense':
        setLeftStats(prev => ({ ...prev, defense: prev.defense + Math.floor(prev.defense * 0.3) }));
        addToBattleLog(`${leftStats.name}'s defense is boosted!`);
        break;
      case 'speed':
        setLeftStats(prev => ({ ...prev, speed: prev.speed + Math.floor(prev.speed * 0.3) }));
        addToBattleLog(`${leftStats.name}'s speed is boosted!`);
        break;
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
        const totalDamage = 100 - rightHealth;
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
        const winner = leftHealth > 0 ? selectedLeftHolobot : selectedRightHolobot;
        const winnerName = leftHealth > 0 ? leftStats.name : rightStats.name;
        const loser = leftHealth > 0 ? selectedRightHolobot : selectedLeftHolobot;
        const loserName = leftHealth > 0 ? rightStats.name : leftStats.name;
        
        if (leftHealth > 0) {
          const updatedLeftStats = {...leftStats};
          const updatedRightStats = {...rightStats};
          updatedLeftStats.intelligence = Math.min(10, updatedLeftStats.intelligence + 1);
          updatedRightStats.intelligence = Math.max(1, updatedRightStats.intelligence - 1);
          setLeftStats(updatedLeftStats);
          setRightStats(updatedRightStats);
          onBattleEnd?.('victory');
          saveBattleResults(selectedLeftHolobot);
        } else {
          const updatedLeftStats = {...leftStats};
          const updatedRightStats = {...rightStats};
          updatedLeftStats.intelligence = Math.max(1, updatedLeftStats.intelligence - 1);
          updatedRightStats.intelligence = Math.min(10, updatedRightStats.intelligence + 1);
          setLeftStats(updatedLeftStats);
          setRightStats(updatedRightStats);
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
              const boostedStats = applySpecialAttack(leftStats);
              setLeftStats(boostedStats);
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
              const boostedStats = applySpecialAttack(rightStats);
              setRightStats(boostedStats);
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
