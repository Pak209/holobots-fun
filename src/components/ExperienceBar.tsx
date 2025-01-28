import { Progress } from "./ui/progress";

interface ExperienceBarProps {
  currentXp: number;
  requiredXp: number;
  level: number;
}

export const ExperienceBar = ({ currentXp, requiredXp, level }: ExperienceBarProps) => {
  const progress = (currentXp / requiredXp) * 100;

  return (
    <div className="w-full p-2 bg-holobots-card rounded-lg border border-holobots-border shadow-neon-border mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-holobots-text">Level {level}</span>
        <span className="text-xs text-holobots-text">
          {currentXp} / {requiredXp} XP
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2"
        indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
      />
    </div>
  );
};