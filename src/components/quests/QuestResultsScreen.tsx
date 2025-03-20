
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExperienceBar } from "@/components/ExperienceBar";
import { Star, Trophy, Clock, Sparkle } from "lucide-react";
import { getExperienceProgress } from "@/utils/battleUtils";
import { HOLOBOT_STATS } from "@/types/holobot";

interface HolobotResult {
  name: string;
  level: number;
  currentXp: number;
  gainedXp: number;
  newLevel?: number;
}

interface QuestResultsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  results: HolobotResult[];
  isVictory: boolean;
  questName: string;
  questRewards?: {
    holos?: number;
    items?: { name: string; type: string; quantity: number }[];
  };
}

export const QuestResultsScreen = ({
  isOpen,
  onClose,
  results,
  isVictory,
  questName,
  questRewards = { holos: 0, items: [] }
}: QuestResultsScreenProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Delay animation start slightly
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-holobots-card border-holobots-accent p-0 overflow-hidden max-w-3xl">
        <DialogHeader className={`p-4 ${isVictory ? 'bg-gradient-to-r from-green-600 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-400'}`}>
          <DialogTitle className="text-center text-white text-xl font-bold flex items-center justify-center gap-2">
            {isVictory ? (
              <>
                <Trophy className="h-5 w-5" />
                QUEST COMPLETE: {questName}
                <Trophy className="h-5 w-5" />
              </>
            ) : (
              <>
                <Clock className="h-5 w-5" />
                QUEST FAILED: {questName}
                <Clock className="h-5 w-5" />
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Experience Gained
          </h3>
          
          <div className="space-y-4 mb-6">
            {results.map((result) => {
              const xpProgress = getExperienceProgress(
                result.currentXp + (showAnimation ? result.gainedXp : 0), 
                result.newLevel || result.level
              );
              
              return (
                <div key={result.name} className="bg-holobots-background/30 p-3 rounded-lg border border-holobots-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black/20 rounded-full overflow-hidden">
                      <img 
                        src={`/lovable-uploads/${HOLOBOT_STATS[result.name.toLowerCase()]?.image || "placeholder.png"}`} 
                        alt={result.name}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{result.name}</span>
                        <span className="text-sm bg-black/30 px-2 py-0.5 rounded">
                          Level {result.level}{result.newLevel && result.newLevel > result.level ? 
                            <span className="text-green-400"> → {result.newLevel}</span> : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ExperienceBar 
                          currentXp={result.currentXp + (showAnimation ? result.gainedXp : 0)}
                          requiredXp={xpProgress.requiredXp}
                          progress={xpProgress.progress}
                          level={result.newLevel || result.level}
                        />
                        
                        <div className={`text-sm font-bold ${showAnimation ? 'text-green-400' : 'text-gray-300'}`}>
                          +{result.gainedXp} XP
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Rewards section (only shown for victories) */}
          {isVictory && questRewards && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-purple-400" />
                Rewards
              </h3>
              
              <div className="bg-holobots-background/30 p-3 rounded-lg border border-holobots-border">
                {questRewards.holos > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-900/50 rounded-full flex items-center justify-center">
                      <span className="text-purple-300 font-bold text-xs">H</span>
                    </div>
                    <span>{questRewards.holos} Holos</span>
                  </div>
                )}
                
                {questRewards.items && questRewards.items.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {questRewards.items.map((item, index) => (
                      <div key={index} className="bg-black/30 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                        <span>{item.name}</span>
                        <span className="text-green-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={onClose}
              className="bg-holobots-accent hover:bg-holobots-hover text-white px-8"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
