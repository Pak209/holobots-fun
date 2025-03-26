
import React from 'react';
import { Button } from "@/components/ui/button";
import { Trophy, X, Award, Star } from "lucide-react";

export interface QuestResultsScreenProps {
  isSuccess: boolean;
  squadHolobotExp: Array<{name: string, xp: number, levelUp: boolean, newLevel: number}>;
  blueprintRewards?: {holobotKey: string, amount: number};
  holosRewards: number;
  expBoosterRewards?: number;
  onClose: () => void;
  isVisible?: boolean;
  squadHolobotKeys?: string[]; // Added this prop to fix the error
}

export const QuestResultsScreen: React.FC<QuestResultsScreenProps> = ({
  isSuccess,
  squadHolobotExp,
  blueprintRewards,
  holosRewards,
  expBoosterRewards,
  onClose,
  isVisible = true,
  squadHolobotKeys
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-holobots-card to-holobots-dark-background border border-holobots-accent/50 rounded-lg max-w-md w-full p-6 relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X />
        </Button>
        
        <div className="text-center mb-6">
          {isSuccess ? (
            <>
              <div className="mb-4">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-holobots-accent mb-2">
                Quest Completed!
              </h2>
              <p className="text-gray-300">
                Your Holobots successfully completed the quest!
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <X className="h-16 w-16 text-red-500 mx-auto p-3 bg-red-500/20 rounded-full" />
              </div>
              <h2 className="text-2xl font-bold text-red-500 mb-2">
                Quest Failed
              </h2>
              <p className="text-gray-300">
                Your Holobots couldn't complete the quest.
              </p>
            </>
          )}
        </div>
        
        <div className="space-y-4">
          {/* XP Rewards */}
          {squadHolobotExp.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-holobots-accent mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Experience Gained
              </h3>
              <div className="space-y-3">
                {squadHolobotExp.map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-white">{result.name}</span>
                      {result.levelUp && (
                        <span className="ml-2 bg-yellow-500/30 text-yellow-300 text-xs px-2 py-0.5 rounded">
                          LEVEL UP!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-yellow-300">+{result.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Blueprint Rewards */}
          {blueprintRewards && (
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-400 mb-2">
                Blueprint Pieces
              </h3>
              <div className="flex justify-between items-center">
                <span>{blueprintRewards.holobotKey.charAt(0).toUpperCase() + blueprintRewards.holobotKey.slice(1)} Blueprint</span>
                <span className="text-purple-300">+{blueprintRewards.amount}</span>
              </div>
            </div>
          )}
          
          {/* Holos Rewards */}
          {holosRewards > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-400 mb-2">
                Holos Tokens
              </h3>
              <div className="flex justify-between items-center">
                <span>Earned Holos</span>
                <span className="text-yellow-300">+{holosRewards}</span>
              </div>
            </div>
          )}
          
          {/* EXP Booster Rewards */}
          {expBoosterRewards && expBoosterRewards > 0 && (
            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-400 mb-2">
                EXP Battle Boosters
              </h3>
              <div className="flex justify-between items-center">
                <span>Battle Boosters</span>
                <span className="text-blue-300">+{expBoosterRewards}</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={onClose}
            className="w-full mt-4 bg-holobots-accent text-white hover:bg-holobots-hover"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
