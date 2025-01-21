import { cn } from "@/lib/utils";

interface CharacterProps {
  isLeft?: boolean;
  isDamaged?: boolean;
}

export const Character = ({ isLeft = true, isDamaged = false }: CharacterProps) => {
  return (
    <div className={cn(
      "relative w-16 h-16 animate-character-idle transition-colors duration-200",
      isLeft ? "scale-x-1" : "scale-x-[-1]",
      isDamaged && "bg-retro-health"
    )}>
      <div className={cn(
        "w-full h-full bg-retro-highlight rounded-sm transition-all duration-200",
        isDamaged && "opacity-50"
      )} 
      style={{ 
        imageRendering: "pixelated",
        boxShadow: "0 0 10px rgba(155, 135, 245, 0.5)"
      }} />
    </div>
  );
};