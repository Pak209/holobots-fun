
import { Progress } from "./ui/progress";

interface ExperienceBarProps {
  currentXp: number;
  requiredXp: number;
  progress: number;
  level: number;
}

export const ExperienceBar = ({ currentXp, requiredXp, progress, level }: ExperienceBarProps) => {
  // Ensure values are numbers and not undefined
  const safeCurrentXp = typeof currentXp === 'number' ? currentXp : 0;
  const safeRequiredXp = typeof requiredXp === 'number' ? requiredXp : 100;
  const safeProgress = typeof progress === 'number' ? Math.min(Math.max(progress, 0), 100) : 0;
  const safeLevel = typeof level === 'number' ? level : 1;

  return (
    <div className="w-[100px] md:w-[130px] p-2 bg-holobots-card rounded-lg border border-holobots-border shadow-neon-border mb-2">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-[10px] text-holobots-text">
          <span>Level {safeLevel}</span>
          <span>{safeCurrentXp}/{safeRequiredXp}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center justify-center bg-black rounded w-6 h-6">
            <span className="text-[10px] font-bold text-yellow-400">XP</span>
          </div>
          <Progress 
            value={safeProgress} 
            className="h-2 flex-1"
          />
        </div>
      </div>
    </div>
  );
};
