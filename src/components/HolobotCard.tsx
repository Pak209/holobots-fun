import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  const getHolobotImage = (name: string) => {
    // Create a mapping with lowercase keys for case-insensitive matching
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
    
    // Convert the input name to lowercase for case-insensitive matching
    const normalizedName = name.toLowerCase();
    return images[normalizedName] || "/placeholder.svg";
  };

  return (
    <div className={`w-[100px] md:w-[130px] h-auto rounded-lg ${
      variant === "blue" 
        ? "bg-retro-card-blue border-blue-300" 
        : "bg-retro-card-red border-red-300"
    } border-2 p-1 flex flex-col font-mono text-[6px] md:text-[8px]`}>
      <div className="flex items-center justify-between mb-0.5 bg-black/20 px-1 py-0.5 rounded-md">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <span className={`font-bold ${
          variant === "blue" ? "text-blue-200" : "text-red-200"
        }`}>
          {stats.name}
        </span>
      </div>
      
      <div className="aspect-square bg-black/30 rounded-lg mb-0.5 flex items-center justify-center border border-white/20">
        <img 
          src={getHolobotImage(stats.name)} 
          alt={stats.name} 
          className="w-16 h-16 md:w-20 md:h-20 pixelated object-contain" // Increased image size
        />
      </div>
      
      <div className="bg-black/30 rounded-lg p-0.5 mb-0.5 border border-white/20 flex-1">
        <div className="font-bold text-white mb-0.5 text-[6px]">
          Ability: {stats.specialMove}
        </div>
        <div className="text-[5px] md:text-[6px] text-gray-300">
          Uses its speed to strike first and deal bonus damage.
        </div>
      </div>
      
      <div className="bg-black/30 rounded-lg p-0.5 mb-0.5 border border-white/20">
        <div className="grid grid-cols-4 gap-0.5 text-white text-[5px] md:text-[6px]">
          <div>HP:{stats.maxHealth}</div>
          <div>A:{stats.attack}</div>
          <div>D:{stats.defense}</div>
          <div>S:{stats.speed}</div>
        </div>
      </div>
      
      <div className="flex justify-between text-[5px] md:text-[6px]">
        <div className="text-white font-bold">LV.{stats.level}</div>
        <div className="text-yellow-300 font-bold">Rank:{getRank(stats.level)}</div>
      </div>
    </div>
  );
};