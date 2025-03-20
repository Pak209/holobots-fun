
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { StatusBar } from "@/components/HealthBar";
import { ExperienceBar } from "@/components/ExperienceBar";
import { Trophy, Users, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOLOBOT_STATS } from "@/types/holobot";

interface QuestBattleBannerProps {
  isOpen: boolean;
  onClose: () => void;
  teamHolobots: string[];
  bossHolobot: string;
  teamHealth: number;
  bossHealth: number;
  questName: string;
}

export const QuestBattleBanner = ({
  isOpen,
  onClose,
  teamHolobots,
  bossHolobot,
  teamHealth,
  bossHealth,
  questName
}: QuestBattleBannerProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-holobots-card border-holobots-accent p-0 overflow-hidden max-w-3xl">
        <div className="relative w-full">
          {/* Battle Title Banner */}
          <div className="bg-gradient-to-r from-holobots-accent to-holobots-hover p-3 text-center">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center justify-center gap-2">
              <Swords className="h-5 w-5" />
              {questName}
              <Swords className="h-5 w-5" />
            </h2>
          </div>
          
          {/* Battle Info */}
          <div className="p-4 flex flex-col items-center">
            <div className="grid grid-cols-2 gap-8 w-full mb-6">
              {/* Team Side */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-holobots-accent" />
                  <h3 className="text-md font-bold">YOUR TEAM</h3>
                </div>
                
                <div className="relative h-24 w-20 mb-2">
                  {/* Stacked Holobot Images */}
                  {teamHolobots.map((holobot, index) => (
                    <div 
                      key={holobot} 
                      className={cn(
                        "absolute w-16 h-16 bg-black/20 rounded-full border border-holobots-border overflow-hidden",
                        index === 0 && "top-0 left-2",
                        index === 1 && "top-3 left-0",
                        index === 2 && "top-6 left-4"
                      )}
                    >
                      <img 
                        src={`/lovable-uploads/${HOLOBOT_STATS[holobot]?.image || "placeholder.png"}`} 
                        alt={holobot}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  ))}
                </div>
                
                <StatusBar current={teamHealth} max={100} isLeft={true} type="health" />
              </div>
              
              {/* VS */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className={cn(
                  "px-3 py-2 bg-black rounded-full border-2 border-holobots-accent text-white font-bold",
                  isAnimating && "animate-pulse"
                )}>
                  VS
                </div>
              </div>
              
              {/* Boss Side */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-md font-bold">BOSS</h3>
                </div>
                
                <div className="w-24 h-24 bg-black/20 rounded-full border-2 border-red-500 overflow-hidden mb-2">
                  <img 
                    src={`/lovable-uploads/${HOLOBOT_STATS[bossHolobot]?.image || "placeholder.png"}`} 
                    alt={bossHolobot}
                    className="w-full h-full object-contain" 
                  />
                </div>
                
                <StatusBar current={bossHealth} max={100} isLeft={false} type="health" />
              </div>
            </div>
            
            {/* Animation Effect */}
            <div className={cn(
              "w-full h-2 bg-gradient-to-r from-holobots-accent to-holobots-hover rounded-full",
              isAnimating && "animate-pulse"
            )} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
