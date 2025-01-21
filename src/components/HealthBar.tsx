import { cn } from "@/lib/utils";

interface HealthBarProps {
  current: number;
  max: number;
  isLeft?: boolean;
}

export const HealthBar = ({ current, max, isLeft = true }: HealthBarProps) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className={cn(
      "relative w-full h-4 bg-black/50 border-2 border-white/20 overflow-hidden",
      isLeft ? "rounded-r-lg" : "rounded-l-lg"
    )}>
      <div
        className={cn(
          "absolute top-0 h-full bg-retro-health transition-transform duration-300",
          isLeft ? "left-0" : "right-0"
        )}
        style={{ 
          width: "100%",
          transform: `scaleX(${percentage / 100})`,
          transformOrigin: isLeft ? "left" : "right"
        }}
      />
    </div>
  );
};