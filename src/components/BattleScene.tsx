import { useState, useEffect } from "react";
import { StatusBar } from "./HealthBar";
import { Character } from "./Character";
import { AttackParticle } from "./AttackParticle";
import { Button } from "./ui/button";
import { Rocket, Zap, Menu } from "lucide-react";
import { HolobotCard } from "./HolobotCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

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

  const addToBattleLog = (message: string) => {
    setBattleLog(prev => [...prev, message]);
  };

  const calculateDamage = (attacker: string, defender: string) => {
    const attackerStats = HOLOBOT_STATS[attacker];
    const defenderStats = HOLOBOT_STATS[defender];
    let damage = Math.max(0, attackerStats.attack - defenderStats.defense);
    
    // Speed affects miss chance
    if (defenderStats.speed > attackerStats.speed && Math.random() > 0.8) {
      addToBattleLog(`${attackerStats.name}'s attack missed!`);
      return 0;
    }
    
    return damage;
  };

  useEffect(() => {
    if (!isBattleStarted) return;

    const interval = setInterval(() => {
      const attacker = Math.random() > 0.5;
      
      if (attacker) {
        setLeftIsAttacking(true);
        const damage = calculateDamage(selectedLeftHolobot, selectedRightHolobot);
        
        setTimeout(() => {
          setRightIsDamaged(true);
          setRightHealth(prev => Math.max(0, prev - damage));
          setLeftSpecial(prev => Math.min(100, prev + 10));
          setLeftHack(prev => Math.min(100, prev + 5));
          
          addToBattleLog(`${HOLOBOT_STATS[selectedLeftHolobot].name} attacks for ${damage} damage!`);
          
          setTimeout(() => {
            setRightIsDamaged(false);
            setLeftIsAttacking(false);
          }, 200);
        }, 500);
      } else {
        setRightIsAttacking(true);
        const damage = calculateDamage(selectedRightHolobot, selectedLeftHolobot);
        
        setTimeout(() => {
          setLeftIsDamaged(true);
          setLeftHealth(prev => Math.max(0, prev - damage));
          setRightSpecial(prev => Math.min(100, prev + 10));
          setRightHack(prev => Math.min(100, prev + 5));
          
          addToBattleLog(`${HOLOBOT_STATS[selectedRightHolobot].name} attacks for ${damage} damage!`);
          
          setTimeout(() => {
            setLeftIsDamaged(false);
            setRightIsAttacking(false);
          }, 200);
        }, 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isBattleStarted, selectedLeftHolobot, selectedRightHolobot]);

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

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center mb-1">
        <div className="flex gap-1.5">
          <Button 
            variant="outline"
            className="bg-purple-600 hover:bg-purple-700 text-white border-none text-xs"
            size="sm"
            onClick={handleStartBattle}
            disabled={isBattleStarted}
          >
            Start Battle
          </Button>
          <Button 
            variant="outline"
            className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-xs"
            size="sm"
          >
            <Rocket className="w-3 h-3 md:w-4 md:h-4" /> Hype
          </Button>
          <Button 
            variant="outline"
            className="bg-red-500 hover:bg-red-600 text-white border-none text-xs"
            size="sm"
          >
            <Zap className="w-3 h-3 md:w-4 md:h-4" /> Hack
          </Button>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="block md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 pt-4">
              <Select value={selectedLeftHolobot} onValueChange={setSelectedLeftHolobot}>
                <SelectTrigger className="bg-white/10 text-white border-white/20">
                  <SelectValue placeholder="Choose Holobot" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                    <SelectItem key={key} value={key}>
                      {stats.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedRightHolobot} onValueChange={setSelectedRightHolobot}>
                <SelectTrigger className="bg-white/10 text-white border-white/20">
                  <SelectValue placeholder="Choose Enemy" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                    <SelectItem key={key} value={key}>
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
            <SelectTrigger className="w-32 bg-white/10 text-white border-white/20">
              <SelectValue placeholder="Choose Holobot" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <SelectItem key={key} value={key}>
                  {stats.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedRightHolobot} onValueChange={setSelectedRightHolobot}>
            <SelectTrigger className="w-32 bg-white/10 text-white border-white/20">
              <SelectValue placeholder="Choose Enemy" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(HOLOBOT_STATS).map(([key, stats]) => (
                <SelectItem key={key} value={key}>
                  {stats.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-2">
        <HolobotCard stats={HOLOBOT_STATS[selectedLeftHolobot]} variant="blue" />
        <HolobotCard stats={HOLOBOT_STATS[selectedRightHolobot]} variant="red" />
      </div>
      
      <div className="relative w-full max-w-3xl mx-auto h-24 md:h-32 bg-retro-background rounded-lg overflow-hidden border-2 border-retro-accent/30">
        <div className="absolute inset-0 bg-gradient-to-t from-retro-background to-retro-accent/20" />
        
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

      <div className="w-full p-2 bg-black/30 rounded-lg border border-white/20 mt-1">
        <div className="h-20 overflow-y-auto text-xs md:text-sm text-white font-mono space-y-1">
          {battleLog.map((log, index) => (
            <p key={index}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
};