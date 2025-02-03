import { Progress } from "./ui/progress";
import { Gauge } from "lucide-react";

interface ExperienceBarProps {
  currentXp: number;
  requiredXp: number;
  progress: number;
  level: number;
}

export const ExperienceBar = ({ progress }: ExperienceBarProps) => {
  return (
    <div className="w-[200px] md:w-[250px] p-2 bg-black/90 rounded border border-holobots-accent/20 shadow-neon-blue">
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 font-bold text-sm">XP</span>
        <Progress 
          value={progress} 
          className="h-3 flex-1 bg-black/60 border border-holobots-accent/30"
        />
      </div>
    </div>
  );
};