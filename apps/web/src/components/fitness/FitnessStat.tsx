
import { Activity, Timer, BarChart4, Zap, Footprints } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type FitnessStatIcon = "steps" | "time" | "calories" | "power";

interface FitnessStatProps {
  icon: FitnessStatIcon;
  label: string;
  value: string;
  subValue?: string;
  progress?: number;
  className?: string;
}

export function FitnessStat({ icon, label, value, subValue, progress = 0, className }: FitnessStatProps) {
  const getIcon = () => {
    switch (icon) {
      case "steps":
        return <Footprints className="h-5 w-5 text-cyan-400" />;
      case "time":
        return <Timer className="h-5 w-5 text-cyan-400" />;
      case "calories":
        return <BarChart4 className="h-5 w-5 text-cyan-400" />;
      case "power":
        return <Zap className="h-5 w-5 text-cyan-400" />;
      default:
        return null;
    }
  };
  
  return (
    <div className={cn("bg-black/40 rounded-lg p-3 border border-cyan-500/20", className)}>
      <div className="flex items-center gap-2 mb-1">
        {getIcon()}
        <span className="text-xs text-cyan-400">{label}</span>
      </div>
      
      <div className="text-lg font-bold text-white mb-1">{value}</div>
      
      {subValue && <div className="text-xs text-gray-400 mb-1">{subValue}</div>}
      
      {progress !== undefined && (
        <Progress 
          value={progress} 
          className="h-1 bg-gray-800"
        />
      )}
    </div>
  );
}
