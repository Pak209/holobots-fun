interface BattleLogProps {
  logs: string[];
}

export const BattleLog = ({ logs }: BattleLogProps) => {
  return (
    <div className="w-full p-2 bg-holobots-card rounded-lg border border-holobots-border shadow-neon mt-1">
      <div className="h-20 overflow-y-auto text-xs md:text-sm text-holobots-text font-mono space-y-1">
        {[...logs].reverse().map((log, index) => (
          <p key={index} className="hover:text-holobots-accent transition-colors duration-300">{log}</p>
        ))}
      </div>
    </div>
  );
};