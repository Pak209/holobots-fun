
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
  const holobotName = stats.name?.toUpperCase();
  const imagePath = getHolobotImagePath(holobotName);
  const rankColor = getRankColor(stats.level || 1);
  
  console.log(`Rendering HolobotCard for ${holobotName} with image path: ${imagePath}`);
  
  return (
    <div className={`w-[130px] md:w-[180px] h-auto rounded-lg ${
      variant === "red" ? "bg-red-900/80 border-red-400" : rankColor
    } border-2 p-1.5 flex flex-col font-mono text-[8px] transition-all duration-300 hover:scale-105 shadow-lg`}>
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
            
            if (!target.src.includes('placeholder')) {
              if (holobotName?.toUpperCase() === 'ACE') {
                const acePath = "/lovable-uploads/7223a5e5-abcb-4911-8436-bddbbd851ae2.png";
                console.log(`Using direct ACE path: ${acePath}`);
                target.src = acePath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'ERA') {
                const eraPath = "/lovable-uploads/c2cd6b0a-0e49-4ede-9507-e55d05aa608d.png";
                console.log(`Using direct ERA path: ${eraPath}`);
                target.src = eraPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'SHADOW') {
                const shadowPath = "/lovable-uploads/ef60f626-b571-46ba-9d37-6045b020669a.png";
                console.log(`Using direct SHADOW path: ${shadowPath}`);
                target.src = shadowPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'KUMA') {
                const kumaPath = "/lovable-uploads/78f2c37a-43a3-4cce-a767-bc3f614e7a80.png";
                console.log(`Using direct KUMA path: ${kumaPath}`);
                target.src = kumaPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'GAMA') {
                const gamaPath = "/lovable-uploads/4af336bd-2825-4faf-9b2c-58cc86354b14.png";
                console.log(`Using direct GAMA path: ${gamaPath}`);
                target.src = gamaPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'HARE') {
                const harePath = "/lovable-uploads/4ad952b3-4337-4120-9542-ed14ca1051d5.png";
                console.log(`Using direct HARE path: ${harePath}`);
                target.src = harePath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'KEN') {
                const kenPath = "/lovable-uploads/58e4110e-07f8-44ab-983e-b6caa5098cc3.png";
                console.log(`Using direct KEN path: ${kenPath}`);
                target.src = kenPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'KURAI') {
                const kuraiPath = "/lovable-uploads/a2ce9d10-b01e-4b86-b52b-74f196b39a6c.png";
                console.log(`Using direct KURAI path: ${kuraiPath}`);
                target.src = kuraiPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'TORA') {
                const toraPath = "/lovable-uploads/e79a5ab6-4577-4e0e-a2b9-32cafd91a212.png";
                console.log(`Using direct TORA path: ${toraPath}`);
                target.src = toraPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'TSUIN') {
                const tsuinPath = "/lovable-uploads/e6982da0-9c53-4d62-a2b8-7ede52d89ca7.png";
                console.log(`Using direct TSUIN path: ${tsuinPath}`);
                target.src = tsuinPath;
                return;
              }
              
              if (holobotName?.toUpperCase() === 'WAKE') {
                const wakePath = "/lovable-uploads/e8128616-6ab5-4995-91b8-2989d18a0508.png";
                console.log(`Using direct WAKE path: ${wakePath}`);
                target.src = wakePath;
                return;
              }
              
              const altPath = `/lovable-uploads/${holobotName?.toLowerCase()}.png`;
              console.log(`Trying alternative path for ${holobotName}: ${altPath}`);
              target.src = altPath;
              
              target.onerror = () => {
                console.error(`Alternative path also failed for ${holobotName}, using placeholder`);
                target.src = "/placeholder.svg";
                target.onerror = null;
              };
            }
          }}
        />
      </div>
      
      <div className="bg-black/40 rounded-lg p-1.5 mb-1 border border-white/20">
        <div className="font-bold text-white mb-0.5 text-[6px] md:text-[8px]">
          Ability: {stats.specialMove || "None"}
        </div>
        <div className="text-[5px] md:text-[7px] text-gray-300 leading-tight">
          {stats.abilityDescription || "No ability description available."}
        </div>
      </div>
      
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
