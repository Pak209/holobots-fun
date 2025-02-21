import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";
interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}
export const HolobotCard = ({
  stats,
  variant = "blue"
}: HolobotCardProps) => {
  const getHolobotImage = (name: string | undefined) => {
    if (!name) return "/placeholder.svg";
    const images: Record<string, string> = {
      "ace": "/lovable-uploads/ace.png",
      "kuma": "/lovable-uploads/kuma.png",
      "shadow": "/lovable-uploads/shadow.png",
      "hare": "/lovable-uploads/hare.png",
      "tora": "/lovable-uploads/tora.png",
      "wake": "/lovable-uploads/wake.png",
      "era": "/lovable-uploads/era.png",
      "gama": "/lovable-uploads/gama.png",
      "ken": "/lovable-uploads/ken.PNG",
      "kurai": "/lovable-uploads/kurai.png",
      "tsuin": "/lovable-uploads/tsuin.png",
      "wolf": "/lovable-uploads/wolf.png"
    };
    const normalizedName = name.toLowerCase();
    return images[normalizedName] || "/placeholder.svg";
  };
  return <div className={`w-[100px] md:w-[130px] h-auto rounded-lg ${variant === "blue" ? "bg-holobots-card border-blue-300 shadow-neon-blue" : "bg-red-100 border-red-300 shadow-neon-border"} border-2 p-1 flex flex-col font-mono text-[6px] md:text-[8px] transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between mb-0.5 bg-black/20 px-1 py-0.5 rounded-md">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <span className={`font-bold ${variant === "blue" ? "text-blue-200" : "text-red-200"}`}>
          {stats.name || "UNKNOWN"}
        </span>
      </div>
      
      <div className="aspect-square bg-black/30 mb-0.5 flex items-center justify-center border border-white/20 hover:border-holobots-accent transition-colors duration-150 rounded-sm">
        <img src={getHolobotImage(stats.name)} alt={stats.name || "Unknown Holobot"} className="w-16 h-16 md:w-20 md:h-20 pixelated object-contain hover:animate-pulse" />
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
    </div>;
};