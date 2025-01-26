interface BattleLogProps {
  logs: string[];
}

export const BattleLog = ({ logs }: BattleLogProps) => {
  return (
    <div className="w-full p-2 bg-black/30 rounded-lg border border-white/20 mt-1">
      <div className="h-20 overflow-y-auto text-xs md:text-sm text-white font-mono space-y-1">
        {[...logs].reverse().map((log, index) => (
          <p key={index}>{log}</p>
        ))}
      </div>
    </div>
  );
};