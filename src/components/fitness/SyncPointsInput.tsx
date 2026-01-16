import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSyncPointsStore } from "@/stores/syncPointsStore";
import { DEFAULT_SYNC_CONFIG } from "@/types/syncPoints";

export function SyncPointsInput() {
  const [stepInput, setStepInput] = useState("");
  const { addStepsEntry, stats } = useSyncPointsStore();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const steps = parseInt(stepInput);
    if (isNaN(steps) || steps < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid number of steps",
        variant: "destructive",
      });
      return;
    }

    if (steps > 50000) {
      toast({
        title: "Too Many Steps",
        description: "That seems like a lot! Please enter a realistic number of steps.",
        variant: "destructive",
      });
      return;
    }

    addStepsEntry(steps);
    setStepInput("");
    
    const syncPoints = Math.floor(steps / DEFAULT_SYNC_CONFIG.stepsPerSyncPoint);
    const streakBonus = stats.streak > 0 ? `(${stats.streak}x streak bonus)` : "";
    
    toast({
      title: "Steps Added!",
      description: `${steps.toLocaleString()} steps converted to ${syncPoints} Sync Points ${streakBonus}`,
    });
  };

  const calculatePreviewSyncPoints = () => {
    const steps = parseInt(stepInput);
    if (isNaN(steps) || steps < DEFAULT_SYNC_CONFIG.minimumStepsForReward) {
      return 0;
    }
    
    const baseSyncPoints = Math.floor(steps / DEFAULT_SYNC_CONFIG.stepsPerSyncPoint);
    const streakIndex = Math.min(stats.streak, DEFAULT_SYNC_CONFIG.bonusMultipliers.streak.length - 1);
    const streakMultiplier = stats.streak > 0 ? DEFAULT_SYNC_CONFIG.bonusMultipliers.streak[streakIndex] : 1;
    
    return Math.floor(baseSyncPoints * streakMultiplier);
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-green-500/30 shadow-[0_0_15px_rgba(0,255,0,0.15)]">
      <CardHeader>
        <CardTitle className="text-green-400 text-center">SYNC POINTS INPUT</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="steps" className="text-green-300">
              Steps Today
            </Label>
            <Input
              id="steps"
              type="number"
              placeholder="Enter your steps..."
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              className="bg-black/50 border-green-500/30 text-white placeholder-gray-400"
              min="0"
              max="50000"
            />
          </div>
          
          {stepInput && (
            <div className="space-y-2 p-3 bg-black/40 rounded-lg border border-green-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-green-300">Preview:</span>
                <span className="text-white">
                  {parseInt(stepInput).toLocaleString()} steps
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-300">Sync Points:</span>
                <span className="text-green-400 font-bold">
                  +{calculatePreviewSyncPoints()}
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
            </div>
          )}
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>• {DEFAULT_SYNC_CONFIG.stepsPerSyncPoint} steps = 1 Sync Point</p>
            <p>• Minimum {DEFAULT_SYNC_CONFIG.minimumStepsForReward.toLocaleString()} steps required</p>
            <p>• Streak bonuses apply for consecutive days</p>
            <p>• Sync Training earns {DEFAULT_SYNC_CONFIG.syncTrainingPointsPerMinute} SP/min (+50% bonus)</p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
            disabled={!stepInput || parseInt(stepInput) < DEFAULT_SYNC_CONFIG.minimumStepsForReward}
          >
            ADD STEPS
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 