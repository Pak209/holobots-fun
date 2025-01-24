import { HolobotStats } from "@/types/holobot";
import { getRank } from "@/types/holobot";
import { Shield, Zap, Star } from "lucide-react";

interface HolobotCardProps {
  stats: HolobotStats;
  variant?: "blue" | "red";
}

export const HolobotCard = ({ stats, variant = "blue" }: HolobotCardProps) => {
  return (
    <div className={`w-64 h-96 rounded-lg border-4 ${variant === "blue" ? "border-blue-500 bg-blue-900/20" : "border-red-500 bg-red-900/20"} p-4 flex flex-col`}>
      <div className="text-xl font-bold italic text-left mb-2">HOLOBOTS</div>
      <div className={`text-right text-lg font-semibold ${variant === "blue" ? "text-blue-400" : "text-red-400"}`}>
        {stats.name}
      </div>
      
      <div className="flex-1 bg-gray-800 rounded-lg my-2 flex items-center justify-center">
        <img src="/placeholder.svg" alt={stats.name} className="w-32 h-32" />
      </div>
      
      <div className="bg-gray-800/60 rounded p-2 mb-2">
        <div className="text-sm font-semibold mb-1">Ability: {stats.specialMove}</div>
        <div className="text-xs text-gray-300">
          Unleashes a powerful strike that deals bonus damage based on speed.
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="flex items-center gap-1">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">{stats.attack}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="text-sm">{stats.defense}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-purple-500" />
          <span className="text-sm">{stats.speed}</span>
        </div>
      </div>
      
      <div className="flex justify-between text-sm">
        <div>LV.{stats.level}</div>
        <div className="text-gray-400">{getRank(stats.level)}</div>
      </div>
    </div>
  );
};