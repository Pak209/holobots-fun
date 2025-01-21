import { useState, useEffect } from "react";
import { HealthBar } from "./HealthBar";
import { Character } from "./Character";

export const BattleScene = () => {
  const [leftHealth, setLeftHealth] = useState(100);
  const [rightHealth, setRightHealth] = useState(100);

  // Simulate battle progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLeftHealth(prev => Math.max(0, prev - Math.random() * 5));
      setRightHealth(prev => Math.max(0, prev - Math.random() * 5));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-[9/16] max-h-screen bg-retro-background overflow-hidden">
      {/* Background with parallax effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-retro-background to-retro-accent/20" />
      
      {/* UI Layer */}
      <div className="relative z-10 w-full h-full p-4 flex flex-col">
        {/* Top UI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <HealthBar current={leftHealth} max={100} isLeft={true} />
            <div className="px-4 py-2 bg-black/50 rounded-lg animate-vs-pulse">
              <span className="text-white font-bold text-xl">VS</span>
            </div>
            <HealthBar current={rightHealth} max={100} isLeft={false} />
          </div>
        </div>

        {/* Characters */}
        <div className="flex-1 flex justify-between items-center px-8">
          <Character isLeft={true} />
          <Character isLeft={false} />
        </div>
      </div>
    </div>
  );
};