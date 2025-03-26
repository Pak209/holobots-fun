
import { Button } from "@/components/ui/button";
import { Coins, Star, Award } from "lucide-react";

export interface WorkoutRewardsProps {
  holobotName: string;
  duration: number;
  calories: number;
  exp: number;
  tokens: number;
  onClose: () => void;
}

export const WorkoutRewards = ({ holobotName, duration, calories, exp, tokens, onClose }: WorkoutRewardsProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-[90%] max-w-md p-6 bg-holobots-card border border-holobots-accent rounded-lg shadow-lg animate-slideUp">
        <h3 className="text-xl font-bold text-center text-holobots-accent mb-4">Workout Complete!</h3>
        
        <div className="text-center mb-4">
          <p className="text-gray-300">Great job training your Holobot!</p>
          <p className="font-semibold text-white mt-2">{holobotName}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-holobots-background/50 p-3 rounded-lg border border-holobots-border/30">
            <p className="text-sm text-gray-400">Workout Time</p>
            <p className="font-medium">{duration} min</p>
          </div>
          <div className="bg-holobots-background/50 p-3 rounded-lg border border-holobots-border/30">
            <p className="text-sm text-gray-400">Calories Burned</p>
            <p className="font-medium">{calories}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-holobots-dark-background to-holobots-card p-4 rounded-lg mb-6">
          <h4 className="text-center text-white font-medium mb-3">Rewards Earned</h4>
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{exp}</span>
              </div>
              <span className="text-xs text-gray-300">EXP</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-1">
                <Coins className="h-5 w-5 text-yellow-400 mr-1" />
                <span className="font-bold text-white">{tokens}</span>
              </div>
              <span className="text-xs text-gray-300">Holos</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onClose}
          className="w-full bg-holobots-accent hover:bg-holobots-accent/80"
        >
          <Award className="mr-2 h-5 w-5" />
          Claim Rewards
        </Button>
      </div>
    </div>
  );
};
