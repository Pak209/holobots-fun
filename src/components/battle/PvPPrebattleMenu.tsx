import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";
import { Sword, Shield, Zap, Search } from "lucide-react";

interface PvPPrebattleMenuProps {
  onStartMatch: (selectedHolobot: string) => void;
}

export const PvPPrebattleMenu = ({ onStartMatch }: PvPPrebattleMenuProps) => {
  const { user } = useAuth();
  const [selectedHolobot, setSelectedHolobot] = useState<string | null>(null);
  const [userHolobots, setUserHolobots] = useState<any[]>([]);

  useEffect(() => {
    if (user?.holobots && Array.isArray(user.holobots)) {
      setUserHolobots(user.holobots);
      
      // Auto-select the first holobot if available
      if (user.holobots.length > 0 && !selectedHolobot) {
        const firstHolobot = user.holobots[0];
        const holobotKey = getHolobotKeyByName(firstHolobot.name);
        setSelectedHolobot(holobotKey);
      }
    }
  }, [user, selectedHolobot]);

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0];
  };

  const handleHolobotSelect = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
  };

  const handleQuickMatch = () => {
    if (selectedHolobot) {
      onStartMatch(selectedHolobot);
    }
  };

  // Helper to get user holobot by key
  const getUserHolobotByKey = (key: string) => userHolobots.find(h => getHolobotKeyByName(h.name) === key);

  const selectedUserHolobot = selectedHolobot ? getUserHolobotByKey(selectedHolobot) : null;

  return (
    <Card className="border-4 border-[#F5C400] bg-black shadow-[0_0_30px_rgba(245,196,0,0.3)]" style={{
      clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
    }}>
      <CardHeader className="py-3 bg-gradient-to-r from-[#F5C400] to-[#D4A400]" style={{
        clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)'
      }}>
        <CardTitle className="text-center text-2xl text-black font-bold tracking-widest uppercase">Real-Time Arena</CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-gradient-to-b from-black via-gray-900 to-black space-y-4">
        {/* Holobot Selection */}
        <div>
          <h3 className="text-[#F5C400] mb-2 text-center font-bold tracking-wider uppercase text-sm border-b-2 border-[#F5C400] pb-1">
            {selectedUserHolobot ? selectedUserHolobot.name : 'Select Your Holobot'}
          </h3>
          <Select value={selectedHolobot || undefined} onValueChange={handleHolobotSelect}>
            <SelectTrigger className="w-full bg-black text-white border-2 border-[#F5C400]/50 hover:border-[#F5C400] transition-colors" style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
            }}>
              {selectedHolobot ? (
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10 border border-cyan-400">
                    <AvatarImage src={getHolobotImagePath(selectedUserHolobot?.name || selectedHolobot)} alt={selectedUserHolobot?.name || selectedHolobot} />
                    <AvatarFallback>{(selectedUserHolobot?.name || selectedHolobot).slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-semibold text-white">{selectedUserHolobot?.name}</span>
                    <span className="text-cyan-300 ml-2">Lv.{selectedUserHolobot?.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1">
                      <Sword className="h-3 w-3 text-red-400" />
                      <span className="text-cyan-300">{HOLOBOT_STATS[selectedHolobot]?.attack}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-blue-400" />
                      <span className="text-cyan-300">{HOLOBOT_STATS[selectedHolobot]?.defense}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-yellow-300" />
                      <span className="text-cyan-300">{HOLOBOT_STATS[selectedHolobot]?.speed}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <SelectValue placeholder="Choose your Holobot" />
              )}
            </SelectTrigger>
            <SelectContent className="bg-black border-3 border-[#F5C400] shadow-[0_0_20px_rgba(245,196,0,0.4)]">
              {userHolobots.map((holobot) => {
                const holobotKey = getHolobotKeyByName(holobot.name);
                return (
                  <SelectItem 
                    key={holobotKey} 
                    value={holobotKey} 
                    className="flex items-center gap-2 text-white hover:bg-[#F5C400]/20 hover:text-[#F5C400] focus:bg-[#F5C400]/20 focus:text-[#F5C400] font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-cyan-400">
                        <AvatarImage src={getHolobotImagePath(holobot.name)} alt={holobot.name} />
                        <AvatarFallback>{holobot.name.slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {holobot.name} (Lv.{holobot.level})
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Match Button */}
        <Button
          onClick={handleQuickMatch}
          disabled={!selectedHolobot}
          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-white font-black py-6 text-lg uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.8)] transition-all disabled:shadow-none"
          style={{
            clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
          }}
        >
          <Search className="mr-2 h-6 w-6" />
          Quick Match
        </Button>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#F5C400]/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black px-4 text-sm text-gray-400 uppercase tracking-wider font-bold">OR</span>
          </div>
        </div>

        {/* Create Private Room */}
        <div className="space-y-2">
          <Button
            disabled
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-black py-4 uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all disabled:shadow-none"
            style={{
              clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
            }}
          >
            🥊 Create Private Room
          </Button>

          {/* Room Code Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room Code"
              disabled
              className="flex-1 bg-black text-white border-2 border-[#F5C400]/30 px-3 py-2 text-sm uppercase tracking-wider disabled:opacity-50"
              style={{
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
              }}
            />
            <Button
              disabled
              className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-6 uppercase tracking-wider transition-all"
              style={{
                clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
              }}
            >
              Join Room
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
