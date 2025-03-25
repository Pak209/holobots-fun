
import { Progress } from "./ui/progress";

interface ExperienceBarProps {
  currentXp: number;
  requiredXp: number;
  progress: number;
  level: number;
}

export const ExperienceBar = ({ currentXp, requiredXp, progress, level }: ExperienceBarProps) => {
  return (
    <div className="w-[100px] md:w-[130px] p-1 bg-holobots-card rounded-lg border border-holobots-border shadow-neon-border mb-2">
      <div className="flex items-center gap-1">
        <div className="flex items-center justify-center bg-black rounded w-6 h-6">
          <span className="text-[10px] font-bold text-yellow-400">XP</span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 flex-1"
        />
      </div>
    </div>
  );
};
