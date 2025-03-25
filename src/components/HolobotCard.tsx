
import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red" | "neutral";
  size?: "sm" | "md" | "lg";
  isCompact?: boolean;
}

export const HolobotCard = ({ 
  stats, 
  variant = "blue",
  size = "md",
  isCompact = false
}: HolobotCardProps) => {
  const cardVariantClasses = {
    blue: "from-blue-900 to-blue-950 border-blue-500",
    red: "from-red-900 to-red-950 border-red-500",
    neutral: "from-gray-800 to-gray-950 border-gray-500",
  };

  const sizeClasses = {
    sm: "max-w-[140px]",
    md: "max-w-[180px]",
    lg: "max-w-[220px]",
  };

  return (
    <div className={`
      relative rounded-md overflow-hidden 
      border-2 shadow-lg transform hover:scale-102 transition-transform
      ${cardVariantClasses[variant]}
      ${sizeClasses[size]}
      ${isCompact ? 'scale-90 transform-origin-top' : ''}
    `}>
      {/* Card background */}
      <div className={`absolute inset-0 bg-gradient-to-b ${cardVariantClasses[variant]} opacity-70`}></div>
      
      {/* Card content */}
      <div className="relative p-2 text-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex flex-col">
            <h3 className="font-bold text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              {stats.name}
            </h3>
            <span className="text-xs text-gray-300 opacity-80">
              {getRank(stats.level || 1)}
            </span>
          </div>
          <div className="bg-black/30 px-1.5 py-0.5 rounded-sm">
            <span className="text-xs font-bold text-yellow-300">
              LV{stats.level || 1}
            </span>
          </div>
        </div>
        
        {/* Image placeholder */}
        <div className="w-full aspect-square bg-black/20 rounded-sm mb-2 flex items-center justify-center overflow-hidden">
          <div className="text-[10px] text-center text-gray-400 p-1">HOLOBOT</div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
          <div className="col-span-2 bg-black/30 px-1.5 py-0.5 rounded-sm mb-1">
            <p className="text-[10px] text-center text-gray-200">
              {stats.specialMove || "Special Move"}
            </p>
          </div>
          <div className="bg-black/20 px-1 py-0.5 rounded-sm">
            <p className="text-[10px]">HP: <span className="text-red-300">{stats.maxHealth}</span></p>
          </div>
          <div className="bg-black/20 px-1 py-0.5 rounded-sm">
            <p className="text-[10px]">ATK: <span className="text-blue-300">{stats.attack}</span></p>
          </div>
          <div className="bg-black/20 px-1 py-0.5 rounded-sm">
            <p className="text-[10px]">DEF: <span className="text-green-300">{stats.defense}</span></p>
          </div>
          <div className="bg-black/20 px-1 py-0.5 rounded-sm">
            <p className="text-[10px]">SPD: <span className="text-yellow-300">{stats.speed}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
