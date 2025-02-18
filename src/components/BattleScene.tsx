import { useState, useEffect } from "react";
import { BattleControls } from "./BattleControls";
import { BattleLog } from "./BattleLog";
import { BattleMeters } from "./battle/BattleMeters";
import { BattleCharacters } from "./battle/BattleCharacters";
import { BattleSelectors } from "./battle/BattleSelectors";
import { BattleCards } from "./battle/BattleCards";
import { ModeSlider } from "./battle/ModeSlider";
import { HOLOBOT_STATS } from "@/types/holobot";
import { calculateDamage, calculateExperience, getNewLevel, applyHackBoost, applySpecialAttack } from "@/utils/battleUtils";

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
  const [leftXp, setLeftXp] = useState(0);
  const [rightXp, setRightXp] = useState(0);
  const [leftLevel, setLeftLevel] = useState(1);
  const [rightLevel, setRightLevel] = useState(1);
  const [leftFatigue, setLeftFatigue] = useState(0);
  const [rightFatigue, setRightFatigue] = useState(0);
  const [isDefenseMode, setIsDefenseMode] = useState(false);
  const [defenseModeRounds, setDefenseModeRounds] = useState(0);

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

  useEffect(() => {
    if (!isBattleStarted) return;

    const interval = setInterval(() => {
      if (leftHealth <= 0 || rightHealth <= 0) {
        setIsBattleStarted(false);
        const winner = leftHealth > 0 ? HOLOBOT_STATS[selectedLeftHolobot].name : HOLOBOT_STATS[selectedRightHolobot].name;
        const loser = leftHealth > 0 ? HOLOBOT_STATS[selectedRightHolobot].name : HOLOBOT_STATS[selectedLeftHolobot].name;
        
        // Update intelligence based on battle result
        if (leftHealth > 0) {
          HOLOBOT_STATS[selectedLeftHolobot].intelligence = Math.min(10, HOLOBOT_STATS[selectedLeftHolobot].intelligence + 1);
          HOLOBOT_STATS[selectedRightHolobot].intelligence = Math.max(1, HOLOBOT_STATS[selectedRightHolobot].intelligence - 1);
          onBattleEnd?.('victory');
        } else {
          HOLOBOT_STATS[selectedLeftHolobot].intelligence = Math.max(1, HOLOBOT_STATS[selectedLeftHolobot].intelligence - 1);
          HOLOBOT_STATS[selectedRightHolobot].intelligence = Math.min(10, HOLOBOT_STATS[selectedRightHolobot].intelligence + 1);
          onBattleEnd?.('defeat');
        }
        
        addToBattleLog(`Battle ended! ${winner} is victorious!`);
        addToBattleLog(`${winner}'s intelligence increased! ${loser}'s intelligence decreased!`);
        clearInterval(interval);
        return;
      }

      // Handle defense mode duration
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
        let damage = calculateDamage(
          { ...HOLOBOT_STATS[selectedLeftHolobot], fatigue: leftFatigue },
          HOLOBOT_STATS[selectedRightHolobot]
        );

        // Apply mode multipliers
        if (isDefenseMode) {
          damage *= 0.5; // Reduced damage in defense mode
          setLeftSpecial(prev => Math.min(100, prev + 15)); // Faster special gauge fill
          setLeftHack(prev => Math.min(100, prev + 10)); // Faster hack gauge fill
        } else {
          // Intelligence affects attack mode multiplier
          const intMultiplier = 1 + (HOLOBOT_STATS[selectedLeftHolobot].intelligence * 0.1);
          damage *= intMultiplier;
        }
        
        setTimeout(() => {
          if (damage > 0) {
            setRightIsDamaged(true);
            setRightHealth(prev => Math.max(0, prev - damage));
            setLeftSpecial(prev => Math.min(100, prev + 10));
            setLeftHack(prev => Math.min(100, prev + 5));
            
            if (leftSpecial >= 100) {
              const boostedStats = applySpecialAttack(HOLOBOT_STATS[selectedLeftHolobot]);
              HOLOBOT_STATS[selectedLeftHolobot] = boostedStats;
              setLeftSpecial(0);
              addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} used their special move!`);
            }
            
            setLeftXp(prev => {
              const newXp = prev + Math.floor(damage * 2);
              const newLevel = getNewLevel(newXp, leftLevel);
              if (newLevel > leftLevel) {
                setLeftLevel(newLevel);
                addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} reached level ${newLevel}!`);
              }
              return newXp;
            });
            
            addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} attacks for ${damage} damage!`);
          } else {
            addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} evaded the attack!`);
          }
          
          setLeftFatigue(prev => prev + (prev > 2 ? 1 : 0));
          
          setTimeout(() => {
            setRightIsDamaged(false);
            setLeftIsAttacking(false);
          }, 100); // Reduced from 200ms
        }, 250); // Reduced from 500ms
      } else {
        setRightIsAttacking(true);
        const damage = calculateDamage(
          { ...HOLOBOT_STATS[selectedRightHolobot], fatigue: rightFatigue },
          HOLOBOT_STATS[selectedLeftHolobot]
        );
        
        setTimeout(() => {
          if (damage > 0) {
            setLeftIsDamaged(true);
            setLeftHealth(prev => Math.max(0, prev - damage));
            setRightSpecial(prev => Math.min(100, prev + 10));
            setRightHack(prev => Math.min(100, prev + 5));
            
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
            
            addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} attacks for ${damage} damage!`);
          } else {
            addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} evaded the attack!`);
          }
          
          setRightFatigue(prev => prev + (prev > 2 ? 1 : 0));
          
          setTimeout(() => {
            setLeftIsDamaged(false);
            setRightIsAttacking(false);
          }, 100); // Reduced from 200ms
        }, 250); // Reduced from 500ms
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBattleStarted, selectedLeftHolobot, selectedRightHolobot, leftLevel, rightLevel, leftFatigue, rightFatigue, leftHealth, rightHealth, isDefenseMode]);

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
          leftXp={leftXp}
          rightXp={rightXp}
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
