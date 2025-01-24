import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  return (
    <div className={`w-[140px] md:w-[180px] h-auto rounded-lg ${
      variant === "blue" 
        ? "bg-retro-card-blue border-blue-300" 
        : "bg-retro-card-red border-red-300"
    } border-2 p-1.5 flex flex-col font-mono text-[10px] md:text-xs`}>
      <div className="flex items-center justify-between mb-1.5 bg-black/20 px-2 py-0.5 rounded-md">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <span className={`font-bold ${
          variant === "blue" ? "text-blue-200" : "text-red-200"
        }`}>
          {stats.name}
        </span>
      </div>
      
      <div className="aspect-square bg-black/30 rounded-lg mb-1.5 flex items-center justify-center border border-white/20">
        <img src="/placeholder.svg" alt={stats.name} className="w-16 h-16 md:w-20 md:h-20 pixelated" />
      </div>
      
      <div className="bg-black/30 rounded-lg p-1.5 mb-1.5 border border-white/20 flex-1">
        <div className="font-bold text-white mb-0.5 text-[10px]">
          Ability: {stats.specialMove}
        </div>
        <div className="text-[8px] md:text-[10px] text-gray-300">
          Uses its speed to strike first and deal bonus damage.
        </div>
      </div>
      
      <div className="bg-black/30 rounded-lg p-1.5 mb-1.5 border border-white/20">
        <div className="grid grid-cols-4 gap-1 text-white text-[8px] md:text-[10px]">
          <div>HP:{stats.maxHealth}</div>
          <div>A:{stats.attack}</div>
          <div>D:{stats.defense}</div>
          <div>S:{stats.speed}</div>
        </div>
      </div>
      
      <div className="flex justify-between text-[8px] md:text-[10px]">
        <div className="text-white font-bold">LV.{stats.level}</div>
        <div className="text-yellow-300 font-bold">Rank:{getRank(stats.level)}</div>
      </div>
    </div>
  );
};