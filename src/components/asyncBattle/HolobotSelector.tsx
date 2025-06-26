import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserHolobot } from "@/types/user";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Star, Zap } from "lucide-react";

interface HolobotSelectorProps {
  holobots: UserHolobot[];
  selectedHolobot: string | null;
  onSelect: (holobotName: string) => void;
}

export function HolobotSelector({ holobots, selectedHolobot, onSelect }: HolobotSelectorProps) {
  if (!holobots || holobots.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-900/80 rounded-lg border-2 border-gray-600/50">
        <p className="text-gray-300 text-sm font-medium">No Holobots available</p>
      </div>
    );
  }

  return (
    <Select value={selectedHolobot || ""} onValueChange={onSelect}>
      <SelectTrigger className="w-full bg-gray-900/90 border-2 border-cyan-500/40 hover:border-cyan-400/60 text-white font-medium">
        <SelectValue placeholder="Select a Holobot" className="text-gray-200" />
      </SelectTrigger>
      <SelectContent className="bg-gray-900/95 border-2 border-cyan-500/50 backdrop-blur-sm">
        {holobots.map((holobot) => (
          <SelectItem 
            key={holobot.name} 
            value={holobot.name}
            className="hover:bg-cyan-500/20 focus:bg-cyan-500/30 cursor-pointer border-b border-gray-700/30 last:border-b-0"
          >
            <div className="flex items-center space-x-3 w-full py-1">
              <img 
                src={getHolobotImagePath(holobot.name)} 
                alt={holobot.name}
                className="w-10 h-10 object-contain rounded-md bg-black/30 p-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{holobot.name}</span>
                  <Badge variant="outline" className="text-xs border-cyan-400/60 text-cyan-300 bg-cyan-500/20">
                    Lvl {holobot.level}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-300 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>{holobot.experience} XP</span>
                  </div>
                  {holobot.rank && (
                    <div className="flex items-center space-x-1">
                      <Zap className="h-3 w-3 text-purple-400" />
                      <span className="text-purple-300">{holobot.rank}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 