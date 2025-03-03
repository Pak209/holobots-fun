
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
    
    // Define image paths for all holobots with the correct mappings
    const images: Record<string, string> = {
      "ace": "/lovable-uploads/8d33b0c2-676e-40c9-845e-8d81095085d1.png",
      "kuma": "/lovable-uploads/dfc882db-6efe-449a-9a18-d58975a0799d.png", 
      "shadow": "/lovable-uploads/707b0fb5-b455-4a6a-9504-ae298ac17275.png",
      "hare": "/lovable-uploads/fb0ae83c-7473-463b-a994-8d6fac2aca3c.png",
      "tora": "/lovable-uploads/bf4d3b8d-ad08-4f80-b179-2cc0a647d1fa.png",
      "wake": "/lovable-uploads/43352190-0af0-4ad7-aa3b-031a7a735552.png",
      "era": "/lovable-uploads/26ccfc85-75a9-45fe-916d-52221d0114ca.png",
      "gama": "/lovable-uploads/538299bd-064f-4e42-beb2-cfc90c89efd2.png",
      "ken": "/lovable-uploads/956995e8-37fb-4c05-ba2e-98678d7e62e2.png",
      "kurai": "/lovable-uploads/e29c3521-a46e-4cac-90c8-5bed2fc4d333.png",
      "tsuin": "/lovable-uploads/d314a7bb-330c-46f6-a763-69d819e20ec2.png",
      "wolf": "/lovable-uploads/8538db67-52ba-404c-be52-f3bba93b356c.png"
    };
    
    // Normalize the name to lowercase for case-insensitive matching
    const normalizedName = name.toLowerCase();
    
    // Add debugging to check the name being requested
    console.log(`Getting image for holobot: ${normalizedName}`);
    
    return images[normalizedName] || "/placeholder.svg";
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
