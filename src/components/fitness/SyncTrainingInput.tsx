import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { useAuth } from "@/contexts/auth";
import { DEFAULT_SYNC_CONFIG } from "@/types/syncPoints";
import { Dumbbell, Clock, Zap } from "lucide-react";

export function SyncTrainingInput() {
  const [minutes, setMinutes] = useState("");
  const [selectedHolobot, setSelectedHolobot] = useState("");
  const { user } = useAuth();
  const { addSyncTrainingEntry, stats } = useSyncPointsStore();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trainingMinutes = parseInt(minutes);
    if (isNaN(trainingMinutes) || trainingMinutes < 1) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of minutes",
        variant: "destructive",
      });
      return;
    }

    if (trainingMinutes > 300) { // 5 hours max
      toast({
        title: "Training Too Long",
        description: "Maximum training session is 5 hours (300 minutes)",
        variant: "destructive",
      });
      return;
    }

    const holobotId = selectedHolobot || undefined;
    addSyncTrainingEntry(trainingMinutes, holobotId);
    setMinutes("");
    
    const baseSP = trainingMinutes * DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute;
    const bonusSP = Math.floor(baseSP * DEFAULT_SYNC_CONFIG.bonusMultipliers.syncTrainingBonus);
    const streakBonus = stats.streak > 0 ? ` (${stats.streak}x streak bonus)` : "";
    
    toast({
      title: "Sync Training Complete!",
      description: `${trainingMinutes} minutes converted to ${bonusSP} Sync Points${streakBonus}`,
    });
  };

  const calculatePreviewSyncPoints = () => {
    const trainingMinutes = parseInt(minutes);
    if (isNaN(trainingMinutes) || trainingMinutes < 1) {
      return 0;
    }
    
    const baseSP = trainingMinutes * DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute;
    const bonusSP = Math.floor(baseSP * DEFAULT_SYNC_CONFIG.bonusMultipliers.syncTrainingBonus);
    
    // Apply streak multiplier
    const streakIndex = Math.min(stats.streak, DEFAULT_SYNC_CONFIG.bonusMultipliers.streak.length - 1);
    const streakMultiplier = stats.streak > 0 ? DEFAULT_SYNC_CONFIG.bonusMultipliers.streak[streakIndex] : 1;
    
    return Math.floor(bonusSP * streakMultiplier);
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-orange-500/30 shadow-[0_0_15px_rgba(255,165,0,0.15)]">
      <CardHeader>
        <CardTitle className="text-orange-400 text-center flex items-center justify-center gap-2">
          <Dumbbell className="w-5 h-5" />
          SYNC TRAINING
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holobot" className="text-orange-300">
              Training Holobot (Optional)
            </Label>
            <Select value={selectedHolobot} onValueChange={setSelectedHolobot}>
              <SelectTrigger className="bg-black/50 border-orange-500/30 text-white">
                <SelectValue placeholder="Select Holobot for Sync Bond bonus..." />
              </SelectTrigger>
              <SelectContent className="bg-black border-orange-500/30">
                {user?.holobots?.map((holobot) => (
                  <SelectItem key={holobot.name} value={holobot.name} className="text-white">
                    {holobot.name} ({holobot.rank || "Champion"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutes" className="text-orange-300">
              Training Minutes
            </Label>
            <Input
              id="minutes"
              type="number"
              placeholder="Enter training minutes..."
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="bg-black/50 border-orange-500/30 text-white placeholder-gray-400"
              min="1"
              max="300"
            />
          </div>
          
          {minutes && (
            <div className="space-y-2 p-3 bg-black/40 rounded-lg border border-orange-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-orange-300">Preview:</span>
                <span className="text-white flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {parseInt(minutes)} minutes
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-300">Sync Points:</span>
                <span className="text-orange-400 font-bold flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  +{calculatePreviewSyncPoints()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-300">Base Rate:</span>
                <span className="text-white">
                  {DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute} SP/min
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-300">Training Bonus:</span>
                <span className="text-yellow-400">
                  +{((DEFAULT_SYNC_CONFIG.bonusMultipliers.syncTrainingBonus - 1) * 100).toFixed(0)}%
                </span>
              </div>
              {stats.streak > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-300">Streak Bonus:</span>
                  <span className="text-yellow-400">
                    {stats.streak} days (×{DEFAULT_SYNC_CONFIG.bonusMultipliers.streak[Math.min(stats.streak - 1, DEFAULT_SYNC_CONFIG.bonusMultipliers.streak.length - 1)]})
                  </span>
                </div>
              )}
              {selectedHolobot && (
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Sync Bond:</span>
                  <span className="text-purple-400">
                    Building with {selectedHolobot}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>• {DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute} SP per minute of training</p>
            <p>• +{((DEFAULT_SYNC_CONFIG.bonusMultipliers.syncTrainingBonus - 1) * 100).toFixed(0)}% bonus vs step tracking</p>
            <p>• Elite/Legendary Holobots earn additional Holos tokens</p>
            <p>• Builds Sync Bond with selected Holobot</p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
            disabled={!minutes || parseInt(minutes) < 1}
          >
            COMPLETE SYNC TRAINING
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 