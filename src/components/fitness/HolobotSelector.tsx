
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserHolobot } from "@/types/user";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { cn } from "@/lib/utils";

interface HolobotSelectorProps {
  holobots: UserHolobot[];
  selectedHolobot: string | null;
  onSelect: (name: string) => void;
}

export function HolobotSelector({ holobots, selectedHolobot, onSelect }: HolobotSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!holobots.length) {
    return (
      <div className="text-center p-4 bg-black/30 backdrop-blur-md rounded-xl border border-cyan-500/30 mb-6">
        <p className="text-gray-400">You don't have any Holobots yet.</p>
      </div>
    );
  }
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? holobots.length - 1 : prev - 1));
    onSelect(holobots[currentIndex === 0 ? holobots.length - 1 : currentIndex - 1].name);
  };
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === holobots.length - 1 ? 0 : prev + 1));
    onSelect(holobots[currentIndex === holobots.length - 1 ? 0 : currentIndex + 1].name);
  };
  
  const currentHolobot = holobots[currentIndex];
  
  return (
    <div className="flex items-center justify-between bg-black/30 backdrop-blur-md rounded-xl border border-cyan-500/30 p-2 mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handlePrevious}
        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex flex-col items-center">
        <div className="flex items-center h-12 w-12 justify-center mb-1">
          <img 
            src={getHolobotImagePath(currentHolobot.name)} 
            alt={currentHolobot.name}
            className="h-10 object-contain"
          />
        </div>
        <h3 className="text-cyan-400 font-bold">{currentHolobot.name}</h3>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-yellow-400">LVL {currentHolobot.level}</span>
          <span className="text-gray-500">•</span>
          <span className="text-purple-400">EXP {currentHolobot.experience}/{currentHolobot.nextLevelExp}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleNext}
        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
}
