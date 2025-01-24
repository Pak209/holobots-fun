import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";
import { Shield, Zap, Star } from "lucide-react";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  return (
    <div className={`w-64 h-96 rounded-lg ${
      variant === "blue" 
        ? "bg-gradient-to-br from-blue-600 to-blue-800 border-blue-300" 
        : "bg-gradient-to-br from-red-600 to-red-800 border-red-300"
    } border-4 p-4 flex flex-col font-mono`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-black/20 px-3 py-1 rounded-md">
          <span className="text-xl font-bold italic text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            HOLOBOTS
          </span>
        </div>
        <div className={`text-lg font-bold ${
          variant === "blue" ? "text-blue-200" : "text-red-200"
        }`}>
          {stats.name}
        </div>
      </div>
      
      <div className="flex-1 bg-black/30 rounded-lg mb-4 flex items-center justify-center border-2 border-white/20">
        <img src="/placeholder.svg" alt={stats.name} className="w-32 h-32 pixelated" />
      </div>
      
      <div className="bg-black/30 rounded-lg p-3 mb-4 border-2 border-white/20">
        <div className="text-sm font-bold text-white mb-1">
          Ability: {stats.specialMove}
        </div>
        <div className="text-xs text-gray-300">
          Uses its speed to strike first and deal bonus damage.
        </div>
      </div>
      
      <div className="bg-black/30 rounded-lg p-3 mb-4 border-2 border-white/20">
        <div className="grid grid-cols-4 gap-2 text-sm text-white">
          <div>HP: {stats.maxHealth}</div>
          <div>A: {stats.attack}</div>
          <div>D: {stats.defense}</div>
          <div>S: {stats.speed}</div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm">
        <div className="text-white font-bold">LV.{stats.level}</div>
        <div className="text-yellow-300 font-bold">Rank: {getRank(stats.level)}</div>
      </div>
    </div>
  );
};