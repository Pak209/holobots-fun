import { useState, useEffect } from "react";
import { StatusBar } from "./HealthBar";
import { Character } from "./Character";
import { AttackParticle } from "./AttackParticle";
import { Button } from "./ui/button";
import { Rocket, Zap } from "lucide-react";

export const BattleScene = () => {
  const [leftHealth, setLeftHealth] = useState(100);
  const [rightHealth, setRightHealth] = useState(100);
  const [leftSpecial, setLeftSpecial] = useState(100);
  const [rightSpecial, setRightSpecial] = useState(100);
  const [leftHack, setLeftHack] = useState(100);
  const [rightHack, setRightHack] = useState(100);
  const [leftIsAttacking, setLeftIsAttacking] = useState(false);
  const [rightIsAttacking, setRightIsAttacking] = useState(false);
  const [leftIsDamaged, setLeftIsDamaged] = useState(false);
  const [rightIsDamaged, setRightIsDamaged] = useState(false);

  // Simulate battle progress with attack animations
  useEffect(() => {
    const interval = setInterval(() => {
      const attacker = Math.random() > 0.5;
      const damage = Math.random() * 5;

      if (attacker) {
        setLeftIsAttacking(true);
        setTimeout(() => {
          setRightIsDamaged(true);
          setRightHealth(prev => Math.max(0, prev - damage));
          setTimeout(() => {
            setRightIsDamaged(false);
            setLeftIsAttacking(false);
          }, 200);
        }, 500);
      } else {
        setRightIsAttacking(true);
        setTimeout(() => {
          setLeftIsDamaged(true);
          setLeftHealth(prev => Math.max(0, prev - damage));
          setTimeout(() => {
            setLeftIsDamaged(false);
            setRightIsAttacking(false);
          }, 200);
        }, 500);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto h-48 bg-retro-background rounded-lg overflow-hidden border-2 border-retro-accent/30">
      <div className="absolute inset-0 bg-gradient-to-t from-retro-background to-retro-accent/20" />
      
      <div className="relative z-10 w-full h-full p-4 flex flex-col">
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 space-y-2">
              <StatusBar current={leftHealth} max={100} isLeft={true} type="health" />
              <StatusBar current={leftSpecial} max={100} isLeft={true} type="special" />
              <StatusBar current={leftHack} max={100} isLeft={true} type="hack" />
            </div>
            <div className="px-4 py-1 bg-black/50 rounded-lg animate-vs-pulse">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <div className="flex-1 space-y-2">
              <StatusBar current={rightHealth} max={100} isLeft={false} type="health" />
              <StatusBar current={rightSpecial} max={100} isLeft={false} type="special" />
              <StatusBar current={rightHack} max={100} isLeft={false} type="hack" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-between items-center px-8">
          <div className="relative flex flex-col items-center gap-2">
            <Character isLeft={true} isDamaged={leftIsDamaged} />
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="bg-yellow-500 hover:bg-yellow-600 text-white border-none"
                size="sm"
              >
                <Rocket className="w-4 h-4" /> Hype Up
              </Button>
              <Button 
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white border-none"
                size="sm"
              >
                <Zap className="w-4 h-4" /> Hack
              </Button>
            </div>
            {rightIsAttacking && <AttackParticle isLeft={false} />}
          </div>
          <div className="relative">
            <Character isLeft={false} isDamaged={rightIsDamaged} />
            {leftIsAttacking && <AttackParticle isLeft={true} />}
          </div>
        </div>
      </div>
    </div>
  );
};
