import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({
  stats,
  variant = "blue"
}: HolobotCardProps) => {
  const holobotName = stats.name?.toUpperCase();
  console.log(`HolobotCard rendering "${holobotName}"`, stats);
  
  const imagePath = getHolobotImagePath(holobotName);
  console.log(`HolobotCard image path for "${holobotName}": ${imagePath}`);
  
  return (
    <div className={`w-[100px] md:w-[130px] h-auto rounded-lg ${variant === "blue" ? "bg-holobots-card border-blue-300 shadow-neon-blue" : "bg-red-100 border-red-300 shadow-neon-border"} border-2 p-1 flex flex-col font-mono text-[6px] md:text-[8px] transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-0.5 bg-black/20 px-1 py-0.5 rounded-md">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <span className={`font-bold ${variant === "blue" ? "text-blue-200" : "text-red-200"}`}>
          {stats.name || "UNKNOWN"}
        </span>
      </div>
      
      <div className="aspect-square bg-black/30 mb-0.5 flex items-center justify-center border border-white/20 hover:border-holobots-accent transition-colors duration-150 rounded-sm mx-0 overflow-hidden">
        <img 
          src={imagePath}
          alt={stats.name || "Unknown Holobot"} 
          className="w-full h-full object-contain hover:animate-pulse"
          loading="eager"
          onError={(e) => {
            console.error(`Failed to load image for holobot: ${stats.name}`, {
              attempted: (e.target as HTMLImageElement).src,
              holobotName: stats.name
            });
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>
      
      <div className="bg-black/30 rounded-lg p-0.5 mb-0.5 border border-white/20">
        <div className="font-bold text-white mb-0.5 text-[6px]">
          Ability: {stats.specialMove || "None"}
        </div>
        <div className="text-[5px] md:text-[6px] text-gray-300">
          {stats.abilityDescription || "No ability description available."}
        </div>
      </div>
      
      <div className="bg-black/30 rounded-lg p-0.5 mb-0.5 border border-white/20">
        <div className="grid grid-cols-4 gap-0.5 text-white text-[5px] md:text-[6px]">
          <div>HP:{stats.maxHealth || 0}</div>
          <div>A:{stats.attack || 0}</div>
          <div>D:{stats.defense || 0}</div>
          <div>S:{stats.speed || 0}</div>
        </div>
      </div>
      
      <div className="flex justify-between text-[5px] md:text-[6px]">
        <div className="text-white font-bold">LV.{stats.level || 1}</div>
        <div className="text-yellow-300 font-bold">Rank:{getRank(stats.level || 1)}</div>
      </div>
    </div>
  );
};
