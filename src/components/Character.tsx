import { cn } from "@/lib/utils";

interface CharacterProps {
  isLeft?: boolean;
}

export const Character = ({ isLeft = true }: CharacterProps) => {
  return (
    <div className={cn(
      "relative w-16 h-16 animate-character-idle",
      isLeft ? "scale-x-1" : "scale-x-[-1]"
    )}>
      <div className="w-full h-full bg-retro-highlight rounded-sm" 
           style={{ 
             imageRendering: "pixelated",
             boxShadow: "0 0 10px rgba(155, 135, 245, 0.5)"
           }} />
    </div>
  );
};