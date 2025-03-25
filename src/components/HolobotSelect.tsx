
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface HolobotSelectProps {
  onSelect: (holobotKey: string) => void;
  selectedHolobot: string;
}

export const HolobotSelect = ({ onSelect, selectedHolobot }: HolobotSelectProps) => {
  const { user } = useAuth();
  const [availableHolobots, setAvailableHolobots] = useState<Array<{ key: string; name: string; level: number }>>([]);

  useEffect(() => {
    if (user?.holobots && Array.isArray(user.holobots)) {
      // Map user's holobots to the format needed for selection
      const holobotOptions = user.holobots.map(holobot => {
        // Find the holobot key by matching name
        const holobotKey = Object.keys(HOLOBOT_STATS).find(
          key => HOLOBOT_STATS[key].name.toLowerCase() === holobot.name.toLowerCase()
        ) || "";
        
        return {
          key: holobotKey,
          name: holobot.name,
          level: holobot.level || 1
        };
      }).sort((a, b) => b.level - a.level); // Sort by level descending
      
      setAvailableHolobots(holobotOptions);
      
      // Auto-select the first holobot if none is selected
      if (!selectedHolobot && holobotOptions.length > 0) {
        onSelect(holobotOptions[0].key);
      }
    }
  }, [user, onSelect, selectedHolobot]);

  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedHolobot} 
        onValueChange={onSelect}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
      >
        {availableHolobots.map((holobot) => (
          <div
            key={holobot.key}
            className={`
              relative flex items-center space-x-2 rounded-md border p-3 cursor-pointer
              ${selectedHolobot === holobot.key
                ? "border-holobots-accent bg-holobots-accent/10"
                : "border-gray-700 bg-black/40 hover:bg-black/30"
              }
            `}
          >
            <RadioGroupItem 
              value={holobot.key} 
              id={`holobot-${holobot.key}`} 
              className="sr-only"
            />
            <Label
              htmlFor={`holobot-${holobot.key}`}
              className="flex flex-1 items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-black/30 border border-gray-700 flex items-center justify-center overflow-hidden">
                  <span className="text-xs text-gray-400">{holobot.name.substring(0, 1)}</span>
                </div>
                <div>
                  <div className="font-medium">{holobot.name}</div>
                  <Badge className="mt-1 bg-black/40 text-xs">Lv.{holobot.level}</Badge>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {availableHolobots.length === 0 && (
        <div className="text-center p-4 border border-red-500/30 bg-red-500/10 rounded-md">
          <p className="text-sm text-red-300">You don't have any Holobots yet!</p>
          <p className="text-xs text-gray-400 mt-1">Complete quests or use Gacha to obtain Holobots.</p>
        </div>
      )}
    </div>
  );
};
