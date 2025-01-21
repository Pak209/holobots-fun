import { useState, useEffect } from "react";
import { HealthBar } from "./HealthBar";
import { Character } from "./Character";
import { AttackParticle } from "./AttackParticle";

export const BattleScene = () => {
  const [leftHealth, setLeftHealth] = useState(100);
  const [rightHealth, setRightHealth] = useState(100);
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
    <div className="relative w-full max-w-3xl mx-auto h-32 bg-retro-background rounded-lg overflow-hidden border-2 border-retro-accent/30">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-retro-background to-retro-accent/20" />
      
      {/* UI Layer */}
      <div className="relative z-10 w-full h-full p-4 flex flex-col">
        {/* Top UI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <HealthBar current={leftHealth} max={100} isLeft={true} />
            <div className="px-4 py-1 bg-black/50 rounded-lg animate-vs-pulse">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <HealthBar current={rightHealth} max={100} isLeft={false} />
          </div>
        </div>

        {/* Characters */}
        <div className="flex-1 flex justify-between items-center px-8">
          <div className="relative">
            <Character isLeft={true} isDamaged={leftIsDamaged} />
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