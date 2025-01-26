interface BattleLogProps {
  logs: string[];
}

export const BattleLog = ({ logs }: BattleLogProps) => {
  return (
    <div className="w-full p-2 bg-cyberpunk-card rounded-lg border border-cyberpunk-border shadow-neon mt-1">
      <div className="h-20 overflow-y-auto text-xs md:text-sm text-cyberpunk-light font-mono space-y-1">
        {[...logs].reverse().map((log, index) => (
          <p key={index} className="animate-glitch">{log}</p>
        ))}
      </div>
    </div>
  );
};