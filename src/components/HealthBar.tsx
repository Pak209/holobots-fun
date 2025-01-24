import { cn } from "@/lib/utils";
import { Heart, Sword, Zap } from "lucide-react";

interface StatusBarProps {
  current: number;
  max: number;
  isLeft?: boolean;
  type: 'health' | 'special' | 'hack';
}

export const StatusBar = ({ current, max, isLeft = true, type }: StatusBarProps) => {
  const percentage = (current / max) * 100;
  
  const getBarColor = () => {
    switch (type) {
      case 'health':
        return 'bg-green-500';
      case 'special':
        return 'bg-yellow-500';
      case 'hack':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'health':
        return <Heart className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />;
      case 'special':
        return <Sword className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />;
      case 'hack':
        return <Zap className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      {isLeft && getIcon()}
      <div className={cn(
        "relative h-3 md:h-4 bg-black/50 border border-white/20 overflow-hidden",
        isLeft ? "rounded-r-lg" : "rounded-l-lg",
        "w-full"
      )}>
        <div
          className={cn(
            "absolute top-0 h-full transition-transform duration-300",
            getBarColor(),
            isLeft ? "left-0" : "right-0"
          )}
          style={{ 
            width: "100%",
            transform: `scaleX(${percentage / 100})`,
            transformOrigin: isLeft ? "left" : "right"
          }}
        />
      </div>
      {!isLeft && getIcon()}
    </div>
  );
};