import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  return (
    <div className={`w-[160px] md:w-[200px] h-auto rounded-lg ${
      variant === "blue" 
        ? "bg-retro-card-blue border-blue-300" 
        : "bg-retro-card-red border-red-300"
    } border-2 p-2 flex flex-col font-mono text-xs md:text-sm`}>
      <div className="flex items-center justify-between mb-2 bg-black/20 px-2 py-1 rounded-md">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <span className={`font-bold ${
          variant === "blue" ? "text-blue-200" : "text-red-200"
        }`}>
          {stats.name}
        </span>
      </div>
      
      <div className="aspect-square bg-black/30 rounded-lg mb-2 flex items-center justify-center border border-white/20">
        <img src="/placeholder.svg" alt={stats.name} className="w-20 h-20 md:w-24 md:h-24 pixelated" />
      </div>
      
      <div className="bg-black/30 rounded-lg p-2 mb-2 border border-white/20 flex-1">
        <div className="font-bold text-white mb-1">
          Ability: {stats.specialMove}
        </div>
        <div className="text-[10px] md:text-xs text-gray-300">
          Uses its speed to strike first and deal bonus damage.
        </div>
      </div>
      
      <div className="bg-black/30 rounded-lg p-2 mb-2 border border-white/20">
        <div className="grid grid-cols-4 gap-1 text-white">
          <div>HP:{stats.maxHealth}</div>
          <div>A:{stats.attack}</div>
          <div>D:{stats.defense}</div>
          <div>S:{stats.speed}</div>
        </div>
      </div>
      
      <div className="flex justify-between text-[10px] md:text-xs">
        <div className="text-white font-bold">LV.{stats.level}</div>
        <div className="text-yellow-300 font-bold">Rank:{getRank(stats.level)}</div>
      </div>
    </div>
  );
};