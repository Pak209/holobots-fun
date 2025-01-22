import { cn } from "@/lib/utils";

interface AttackParticleProps {
  isLeft: boolean;
}

export const AttackParticle = ({ isLeft }: AttackParticleProps) => {
  return (
    <div className={cn(
      "absolute top-1/2 -translate-y-1/2",
      isLeft ? "-left-8" : "-right-8",
      "flex gap-1"
    )}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 bg-retro-accent rounded-sm animate-attack-particle",
            isLeft ? "origin-right" : "origin-left"
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            transform: isLeft ? "scaleX(-1)" : "scaleX(1)"
          }}
        />
      ))}
    </div>
  );
};