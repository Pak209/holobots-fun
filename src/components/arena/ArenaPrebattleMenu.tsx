
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { HOLOBOT_STATS } from "@/types/holobot";
import { HolobotCard } from "@/components/HolobotCard";
import { ExperienceBar } from "@/components/ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { Gem, Ticket, Award } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ArenaPrebattleMenuProps {
  onHolobotSelect: (holobotKey: string) => void;
  onEntryFeeMethod: (method: 'tokens' | 'pass') => void;
  entryFee: number;
}

export const ArenaPrebattleMenu = ({
  onHolobotSelect,
  onEntryFeeMethod,
  entryFee
}: ArenaPrebattleMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [userHolobots, setUserHolobots] = useState<any[]>([]);

  useEffect(() => {
    if (user?.holobots && Array.isArray(user.holobots)) {
      setUserHolobots(user.holobots);
      
      // Auto-select the first holobot if available
      if (user.holobots.length > 0 && !selectedHolobot) {
        setSelectedHolobot(user.holobots[0].key || user.holobots[0].name.toLowerCase());
      }
    }
  }, [user, selectedHolobot]);

  const handleHolobotSelect = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
  };

  const handleConfirmSelection = () => {
    if (!selectedHolobot) {
      toast({
        title: "No Holobot Selected",
        description: "Please select a Holobot to enter the arena.",
        variant: "destructive"
      });
      return;
    }
    onHolobotSelect(selectedHolobot);
  };

  const handlePayWithTokens = () => {
    if (!selectedHolobot) {
      toast({
        title: "No Holobot Selected",
        description: "Please select a Holobot to enter the arena.",
        variant: "destructive"
      });
      return;
    }
    onEntryFeeMethod('tokens');
  };

  const handleUseArenaPass = () => {
    if (!selectedHolobot) {
      toast({
        title: "No Holobot Selected",
        description: "Please select a Holobot to enter the arena.",
        variant: "destructive"
      });
      return;
    }
    onEntryFeeMethod('pass');
  };

  return (
    <Card className="border border-holobots-border bg-[#1A1F2C]">
      <CardHeader>
        <CardTitle className="text-center text-xl text-white">Choose Your Champion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <ScrollArea className="h-60 rounded-md">
            <div className="flex flex-wrap gap-2 justify-center p-1">
              {userHolobots.length > 0 ? (
                userHolobots.map((holobot, index) => {
                  const holobotKey = holobot.key || holobot.name.toLowerCase();
                  const isSelected = selectedHolobot === holobotKey;
                  const baseStats = HOLOBOT_STATS[holobotKey] || HOLOBOT_STATS.ace;
                  
                  return (
                    <div 
                      key={index} 
                      className={`cursor-pointer transition-all duration-200 transform ${isSelected ? 'scale-105 ring-2 ring-holobots-accent' : 'opacity-70 hover:opacity-100'}`}
                      onClick={() => handleHolobotSelect(holobotKey)}
                    >
                      <div className="w-[120px] sm:w-[150px]">
                        <HolobotCard 
                          stats={{
                            ...baseStats,
                            level: holobot.level || 1,
                            name: holobot.name
                          }} 
                          variant={isSelected ? "blue" : "gray"} 
                        />
                        {isSelected && (
                          <ExperienceBar 
                            {...getExperienceProgress(holobot.experience || 0, holobot.level || 1)}
                            level={holobot.level || 1}
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-4 text-gray-400">
                  You don't have any Holobots yet. Visit the Gacha page to get some!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full mt-4">
          <div className="flex-1">
            <p className="text-[#8E9196] mb-2 text-center">Entry fee: {entryFee} Holos tokens</p>
            <p className="text-[#8E9196] mb-4 text-center">Your balance: {user?.holosTokens || 0} Holos</p>
            <Button 
              onClick={handlePayWithTokens}
              disabled={!user || user.holosTokens < entryFee || !selectedHolobot}
              className="w-full bg-holobots-accent hover:bg-holobots-hover text-white"
            >
              <Gem className="mr-2 h-4 w-4" />
              Pay Entry Fee
            </Button>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-gray-700 md:pl-4 pt-4 md:pt-0 flex-1">
            <p className="text-[#8E9196] mb-2 text-center">Your Arena Passes: {user?.arena_passes || 0}</p>
            <Button
              onClick={handleUseArenaPass}
              disabled={!user || !user.arena_passes || user.arena_passes <= 0 || !selectedHolobot}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Award className="mr-2 h-4 w-4" />
              Use Arena Pass
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
