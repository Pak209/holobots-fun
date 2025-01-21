import { cn } from "@/lib/utils";
import { Character3D } from "./Character3D";

interface CharacterProps {
  isLeft?: boolean;
  isDamaged?: boolean;
  modelUrl?: string;
}

export const Character = ({ isLeft = true, isDamaged = false, modelUrl }: CharacterProps) => {
  return (
    <div className={cn(
      "relative w-16 h-16 animate-character-idle transition-colors duration-200",
      isLeft ? "scale-x-1" : "scale-x-[-1]",
      isDamaged && "bg-retro-health"
    )}>
      <Character3D 
        modelUrl={modelUrl}
        isLeft={isLeft}
        isDamaged={isDamaged}
      />
    </div>
  );
};