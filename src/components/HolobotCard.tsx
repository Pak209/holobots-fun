
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
    
    // Normalize the name to lowercase and trim whitespace
    const normalizedName = name.toLowerCase().trim();
    
    console.log(`Looking for holobot image for: ${normalizedName}`);
    
    // Direct mapping for Holobot images to ensure they load correctly
    // Each key is the holobot name from HOLOBOT_STATS and each value is the correct image path
    const directMapping: Record<string, string> = {
      "ace": "/lovable-uploads/26ccfc85-75a9-45fe-916d-52221d0114ca.png",
      "kuma": "/lovable-uploads/8538db67-52ba-404c-be52-f3bba93b356c.png", 
      "shadow": "/lovable-uploads/85a2cf79-1889-472d-9855-3048f24a5597.png",
      "era": "/lovable-uploads/433db76f-724b-484e-bd07-b01fde68f661.png",
      "hare": "/lovable-uploads/c4359243-8486-4c66-9a1b-ee1f00a53fc6.png",
      "tora": "/lovable-uploads/7d5945ea-d44a-4028-8455-8f5f017fa601.png",
      "wake": "/lovable-uploads/538299bd-064f-4e42-beb2-cfc90c89efd2.png",
      "gama": "/lovable-uploads/ec4c76d2-330e-4a83-8252-ff1ff19962e8.png",
      "ken": "/lovable-uploads/3166d0da-114f-4b4b-8c65-79fc3f4e4789.png",
      "kurai": "/lovable-uploads/43352190-0af0-4ad7-aa3b-031a7a735552.png",
      "tsuin": "/lovable-uploads/dfc882db-6efe-449a-9a18-d58975a0799d.png",
      "wolf": "/lovable-uploads/fb0ae83c-7473-463b-a994-8d6fac2aca3c.png"
    };
    
    // Check if the name is directly in the mapping
    if (normalizedName in directMapping) {
      const imagePath = directMapping[normalizedName];
      console.log(`Using direct mapping for ${normalizedName}: ${imagePath}`);
      return imagePath;
    }
    
    // If the normalized name is not found, try to match by the key itself (from HOLOBOT_STATS)
    const holobotKey = Object.keys(directMapping).find(
      key => key.toLowerCase() === normalizedName
    );
    
    if (holobotKey) {
      const imagePath = directMapping[holobotKey];
      console.log(`Found match by key for ${normalizedName}: ${imagePath}`);
      return imagePath;
    }
    
    console.log(`No direct mapping found for ${normalizedName}, falling back to placeholder`);
    return "/placeholder.svg";
  };

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
          src={getHolobotImage(stats.name)} 
          alt={stats.name || "Unknown Holobot"} 
          className="w-full h-full object-contain hover:animate-pulse"
          loading="eager"
          onError={(e) => {
            console.error(`Failed to load image for holobot: ${stats.name}`);
            // Log additional info about what went wrong
            console.log(`Attempted path: ${(e.target as HTMLImageElement).src}`);
            // If image fails to load, set to placeholder
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
