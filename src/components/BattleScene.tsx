import { useState, useEffect } from "react";
import { StatusBar } from "./HealthBar";
import { Character } from "./Character";
import { AttackParticle } from "./AttackParticle";
import { HolobotCard } from "./HolobotCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { BattleControls } from "./BattleControls";
import { BattleLog } from "./BattleLog";
import { calculateDamage, calculateExperience, getNewLevel, applyHackBoost } from "@/utils/battleUtils";

export const BattleScene = () => {
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
  const [selectedLeftHolobot, setSelectedLeftHolobot] = useState("ace");
  const [selectedRightHolobot, setSelectedRightHolobot] = useState("kuma");
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [leftXp, setLeftXp] = useState(0);
  const [rightXp, setRightXp] = useState(0);
  const [leftLevel, setLeftLevel] = useState(1);
  const [rightLevel, setRightLevel] = useState(1);

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
    setIsBattleStarted(true);
    setLeftHealth(100);
    setRightHealth(100);
    setLeftSpecial(0);
    setRightSpecial(0);
    setLeftHack(0);
    setRightHack(0);
    setBattleLog(["Battle started!"]);
  };

  useEffect(() => {
    if (!isBattleStarted) return;

    const interval = setInterval(() => {
      const attacker = Math.random() > 0.5;
      
      if (attacker) {
        setLeftIsAttacking(true);
        const damage = calculateDamage(HOLOBOT_STATS[selectedLeftHolobot], HOLOBOT_STATS[selectedRightHolobot]);
        
        setTimeout(() => {
          setRightIsDamaged(true);
          setRightHealth(prev => Math.max(0, prev - damage));
          setLeftSpecial(prev => Math.min(100, prev + 10));
          setLeftHack(prev => Math.min(100, prev + 5));
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
          
          setTimeout(() => {
            setRightIsDamaged(false);
            setLeftIsAttacking(false);
          }, 200);
        }, 500);
      } else {
        setRightIsAttacking(true);
        const damage = calculateDamage(HOLOBOT_STATS[selectedRightHolobot], HOLOBOT_STATS[selectedLeftHolobot]);
        
        setTimeout(() => {
          setLeftIsDamaged(true);
          setLeftHealth(prev => Math.max(0, prev - damage));
          setRightSpecial(prev => Math.min(100, prev + 10));
          setRightHack(prev => Math.min(100, prev + 5));
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
          
          setTimeout(() => {
            setLeftIsDamaged(false);
            setRightIsAttacking(false);
          }, 200);
        }, 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isBattleStarted, selectedLeftHolobot, selectedRightHolobot, leftLevel, rightLevel]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center mb-1 bg-holobots-card p-4 rounded-lg border border-holobots-border shadow-neon-blue">
        <BattleControls
          onStartBattle={handleStartBattle}
          onHypeUp={handleHypeUp}
          onHack={handleHack}
          isBattleStarted={isBattleStarted}
          hackGauge={leftHack}
        />
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="block md:hidden bg-holobots-card border-holobots-border text-holobots-text hover:bg-holobots-hover"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-holobots-background border-holobots-border">
            <div className="flex flex-col gap-4 pt-4">
              <Select value={selectedLeftHolobot} onValueChange={setSelectedLeftHolobot}>
                <SelectTrigger className="bg-holobots-card text-holobots-text border-holobots-border">
                  <SelectValue placeholder="Choose Holobot" />
                </SelectTrigger>
                <SelectContent className="bg-holobots-card border-holobots-border">
                  {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                    <SelectItem key={key} value={key} className="text-holobots-text hover:bg-holobots-hover">
                      {stats.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRightHolobot} onValueChange={setSelectedRightHolobot}>
                <SelectTrigger className="bg-holobots-card text-holobots-text border-holobots-border">
                  <SelectValue placeholder="Choose Enemy" />
                </SelectTrigger>
                <SelectContent className="bg-holobots-card border-holobots-border">
                  {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                    <SelectItem key={key} value={key} className="text-holobots-text hover:bg-holobots-hover">
                      {stats.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex gap-4">
          <Select value={selectedLeftHolobot} onValueChange={setSelectedLeftHolobot}>
            <SelectTrigger className="w-32 bg-holobots-card text-holobots-text border-holobots-border">
              <SelectValue placeholder="Choose Holobot" />
            </SelectTrigger>
            <SelectContent className="bg-holobots-card border-holobots-border">
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <SelectItem key={key} value={key} className="text-holobots-text hover:bg-holobots-hover">
                  {stats.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedRightHolobot} onValueChange={setSelectedRightHolobot}>
            <SelectTrigger className="w-32 bg-holobots-card text-holobots-text border-holobots-border">
              <SelectValue placeholder="Choose Enemy" />
            </SelectTrigger>
            <SelectContent className="bg-holobots-card border-holobots-border">
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <SelectItem key={key} value={key} className="text-holobots-text hover:bg-holobots-hover">
                  {stats.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative w-full max-w-3xl mx-auto h-24 md:h-32 bg-holobots-background rounded-lg overflow-hidden border-2 border-holobots-border shadow-neon">
        <div className="absolute inset-0 bg-gradient-to-t from-holobots-background to-holobots-accent/5" />
        
        <div className="relative z-10 w-full h-full p-2 md:p-4 flex flex-col">
          <div className="space-y-0.5 md:space-y-1">
            <div className="flex justify-between items-center gap-2 md:gap-4">
              <div className="flex-1 space-y-0.5 md:space-y-1">
                <StatusBar current={leftHealth} max={100} isLeft={true} type="health" />
                <StatusBar current={leftSpecial} max={100} isLeft={true} type="special" />
                <StatusBar current={leftHack} max={100} isLeft={true} type="hack" />
              </div>
              <div className="px-2 py-1 bg-black/50 rounded-lg animate-vs-pulse">
                <span className="text-white font-bold text-xs md:text-sm">VS</span>
              </div>
              <div className="flex-1 space-y-0.5 md:space-y-1">
                <StatusBar current={rightHealth} max={100} isLeft={false} type="health" />
                <StatusBar current={rightSpecial} max={100} isLeft={false} type="special" />
                <StatusBar current={rightHack} max={100} isLeft={false} type="hack" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-between items-center px-4 md:px-8">
            <div className="relative flex flex-col items-center gap-2">
              <Character isLeft={true} isDamaged={leftIsDamaged} />
              {leftIsAttacking && <AttackParticle isLeft={true} />}
            </div>
            <div className="relative flex items-center">
              <Character isLeft={false} isDamaged={rightIsDamaged} />
              {rightIsAttacking && <AttackParticle isLeft={false} />}
            </div>
          </div>
        </div>
      </div>

      <BattleLog logs={battleLog} />
    </div>
  );
};
