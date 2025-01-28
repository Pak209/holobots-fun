import { Progress } from "./ui/progress";
import { Gauge } from "lucide-react";

interface ExperienceBarProps {
  currentXp: number;
  requiredXp: number;
  level: number;
}

export const ExperienceBar = ({ currentXp, requiredXp, level }: ExperienceBarProps) => {
  const progress = (currentXp / requiredXp) * 100;

  return (
    <div className="w-[100px] md:w-[130px] p-1 bg-holobots-card rounded-lg border border-holobots-border shadow-neon-border mb-2">
      <div className="flex items-center gap-1">
        <Gauge className="w-4 h-4 text-holobots-accent" />
        <Progress 
          value={progress} 
          className="h-2 flex-1"
        />
      </div>
    </div>
  );
};