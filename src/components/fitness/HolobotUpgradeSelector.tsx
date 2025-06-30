import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { AttributeUpgrade } from "./AttributeUpgrade";
import { Wrench, ChevronDown } from "lucide-react";

export function HolobotUpgradeSelector() {
  const { user } = useAuth();
  const { getAvailableSyncPoints } = useSyncPointsStore();
  const [selectedHolobot, setSelectedHolobot] = useState<string>("");
  
  const availableSP = getAvailableSyncPoints();

  if (!user?.holobots || user.holobots.length === 0) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Holobots Available</h3>
            <p className="text-sm">You need to own Holobots to upgrade their attributes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedHolobotData = user.holobots.find(bot => bot.name === selectedHolobot);

  return (
    <div className="space-y-6">
      {/* Holobot Selection Header */}
      <Card className="bg-black/30 backdrop-blur-md border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            SELECT HOLOBOT TO UPGRADE
          </CardTitle>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-300">Available Sync Points: {availableSP.toLocaleString()}</span>
            <span className="text-cyan-300">Holobots Owned: {user.holobots.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedHolobot} onValueChange={setSelectedHolobot}>
              <SelectTrigger className="w-full bg-black/50 border-cyan-500/30 text-white h-16">
                <SelectValue placeholder="Choose a Holobot to upgrade...">
                  {selectedHolobotData && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {selectedHolobotData.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-white">{selectedHolobotData.name}</span>
                        <div className="flex gap-2">
                          <Badge className="bg-purple-500 text-white text-xs">
                            {selectedHolobotData.rank || "Champion"}
                          </Badge>
                          <Badge className="bg-yellow-500 text-black text-xs">
                            Lv {selectedHolobotData.level || 1}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </SelectValue>
                <ChevronDown className="w-4 h-4 text-cyan-400" />
              </SelectTrigger>
              <SelectContent className="bg-black border-cyan-500/30 max-h-60">
                {user.holobots.map((holobot) => (
                  <SelectItem 
                    key={holobot.name} 
                    value={holobot.name}
                    className="text-white hover:bg-cyan-500/20 focus:bg-cyan-500/20 p-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {holobot.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-white">{holobot.name}</span>
                        <div className="flex gap-2">
                          <Badge className="bg-purple-500 text-white text-xs">
                            {holobot.rank || "Champion"}
                          </Badge>
                          <Badge className="bg-yellow-500 text-black text-xs">
                            Lv {holobot.level || 1}
                          </Badge>
                          {holobot.experience && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {holobot.experience} EXP
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {!selectedHolobot && (
              <div className="text-center text-sm text-gray-400 py-4">
                Select a Holobot from the dropdown above to begin upgrading attributes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attribute Upgrade Component */}
      {selectedHolobot && selectedHolobotData && (
        <AttributeUpgrade 
          holobotId={selectedHolobot}
          holobotName={selectedHolobot}
        />
      )}
    </div>
  );
} 