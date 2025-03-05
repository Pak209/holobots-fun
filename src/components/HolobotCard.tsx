
import { HolobotStats, getRank } from "@/types/holobot";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

const getRankColor = (level: number): string => {
  if (level >= 41) return "bg-yellow-900/80 border-yellow-400"; // Legendary
  if (level >= 31) return "bg-purple-900/80 border-purple-400"; // Elite
  if (level >= 21) return "bg-blue-900/80 border-blue-400";     // Rare
  if (level >= 11) return "bg-green-900/80 border-green-400";   // Champion
  return "bg-gray-900/80 border-gray-400";                      // Rookie
};

export const HolobotCard = ({
  stats,
  variant = "blue"
}: HolobotCardProps) => {
  // Ensure consistent case handling for the holobot name
  const holobotName = stats.name?.toUpperCase();
  
  // Get the proper image path from our utility function
  const imagePath = getHolobotImagePath(holobotName);
  
  // Get the color based on rank instead of variant
  const rankColor = getRankColor(stats.level || 1);
  
  console.log(`Rendering HolobotCard for ${holobotName} with image path: ${imagePath}`);
  
  return (
    <div className={`w-[130px] md:w-[180px] h-auto rounded-lg ${
      variant === "red" ? "bg-red-900/80 border-red-400" : rankColor
    } border-2 p-1.5 flex flex-col font-mono text-[8px] transition-all duration-300 hover:scale-105 shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1 bg-black/40 px-1.5 py-0.5 rounded-md border border-white/20">
        <span className="font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          HOLOBOTS
        </span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${
            variant === "red" ? "text-red-200" : "text-cyan-200"
          }`}>
            {holobotName || "UNKNOWN"}
          </span>
          <span className="text-yellow-300">Lv.{stats.level || 1}</span>
        </div>
      </div>
      
      {/* Image Container */}
      <div className="aspect-square bg-black/40 rounded-lg mb-1 flex items-center justify-center border border-white/20 hover:border-blue-400/50 transition-colors duration-300 p-1">
        <img 
          src={imagePath}
          alt={holobotName || "Unknown Holobot"} 
          className="w-full h-full object-contain hover:animate-pulse"
          style={{ imageRendering: 'pixelated' }}
          loading="eager"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error(`Failed to load image for holobot: ${holobotName}`, {
              attempted: target.src,
              holobotName
            });
            
            // Try alternative approach if the regular path fails
            if (!target.src.includes('placeholder')) {
              // Try a direct lowercase version as final attempt
              const altPath = `/lovable-uploads/${holobotName?.toLowerCase()}.png`;
              console.log(`Trying alternative path for ${holobotName}: ${altPath}`);
              target.src = altPath;
              
              // Add a second error handler for this alternative path
              target.onerror = () => {
                console.error(`Alternative path also failed for ${holobotName}, using placeholder`);
                target.src = "/placeholder.svg";
                // Remove this error handler to prevent infinite loop
                target.onerror = null;
              };
            }
          }}
        />
      </div>
      
      {/* Ability Section */}
      <div className="bg-black/40 rounded-lg p-1.5 mb-1 border border-white/20">
        <div className="font-bold text-white mb-0.5 text-[6px] md:text-[8px]">
          Ability: {stats.specialMove || "None"}
        </div>
        <div className="text-[5px] md:text-[7px] text-gray-300 leading-tight">
          {stats.abilityDescription || "No ability description available."}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="bg-black/40 rounded-lg p-1.5 border border-white/20">
        <div className="grid grid-cols-4 gap-1 text-white text-[5px] md:text-[7px]">
          <div>HP:{stats.maxHealth || 0}</div>
          <div>A:{stats.attack || 0}</div>
          <div>D:{stats.defense || 0}</div>
          <div>S:{stats.speed || 0}</div>
        </div>
      </div>
      
      <div className="flex justify-between text-[5px] md:text-[7px] mt-0.5">
        <div className="text-white font-bold">LV.{stats.level || 1}</div>
        <div className="text-yellow-300 font-bold">Rank:{getRank(stats.level || 1)}</div>
      </div>
    </div>
  );
};
