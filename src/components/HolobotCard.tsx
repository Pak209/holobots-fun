import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  const getHolobotImage = (name: string) => {
    const images: Record<string, string> = {
      "ACE": "/lovable-uploads/68aa5731-00c2-4136-b181-06313cd864dd.png",
      "KUMA": "/lovable-uploads/32d16b0c-0a96-4d6c-aedc-88354599edd8.png",
      "Shadow": "/lovable-uploads/7d5945ea-d44a-4028-8455-8f5f017fa601.png",
      "HARE": "/lovable-uploads/92cbe29b-a693-4e46-aa5d-e205dd333db1.png",
      "TORA": "/lovable-uploads/859536c7-8d38-41d4-be59-07c12cc8a523.png",
      "WAKE": "/lovable-uploads/3166d0da-114f-4b4b-8c65-79fc3f4e4789.png",
      "ERA": "/lovable-uploads/c4359243-8486-4c66-9a1b-ee1f00a53fc6.png",
      "GAMA": "/lovable-uploads/d857f1e4-00a9-45f6-8015-6aecbaed2359.png",
      "KEN": "/lovable-uploads/d4c4d244-e62c-49bc-a241-60ed9a2c303e.png",
      "KURAI": "/lovable-uploads/kurai.png",
      "TSUIN": "/lovable-uploads/tsuin.png",
      "WOLF": "/lovable-uploads/wolf.png"
    };
    return images[name] || "/placeholder.svg";
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
          className="w-10 h-10 md:w-12 md:h-12 pixelated object-contain"
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