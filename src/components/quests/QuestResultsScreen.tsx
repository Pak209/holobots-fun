
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HOLOBOT_STATS } from "@/types/holobot";
import { Check, X, Trophy, Star, FileText, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface QuestResultsScreenProps {
  isVisible: boolean;
  isSuccess: boolean;
  squadHolobotKeys: string[];
  squadExpResults?: Array<{name: string, xp: number, levelUp: boolean, newLevel: number}>;
  blueprintRewards?: {holobotKey: string, amount: number};
  holosRewards: number;
  gachaTickets?: number;
  onClose: () => void;
}

export const QuestResultsScreen: React.FC<QuestResultsScreenProps> = ({
  isVisible,
  isSuccess,
  squadHolobotKeys,
  squadExpResults = [],
  blueprintRewards,
  holosRewards,
  gachaTickets = 0,
  onClose
}) => {
  // Automatically close after some time
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 15000); // Auto close after 15 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-morphism border-holobots-accent/50 p-0 overflow-hidden">
        <div className={`w-full p-6 ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className="flex justify-center">
            <div className={`rounded-full p-3 ${isSuccess ? 'bg-green-500' : 'bg-red-500'}`}>
              {isSuccess ? (
                <Check className="h-10 w-10 text-white" />
              ) : (
                <X className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold mt-3">
            {isSuccess ? "Quest Successful!" : "Quest Failed!"}
          </h2>
          <p className="text-center text-sm opacity-80 mt-1">
            {isSuccess 
              ? "Your Holobots completed the quest successfully!" 
              : "Your Holobots were defeated during the quest."}
          </p>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Squad Results */}
          {squadExpResults.length > 0 && (
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Squad Performance
              </h3>
              <div className="grid gap-2">
                {squadExpResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 rounded-md bg-black/30 border border-white/10"
                  >
                    <div>
                      <div className="text-sm font-medium">{result.name}</div>
                      <div className="text-xs text-holobots-accent">Level {result.newLevel}</div>
                    </div>
                    <div className="text-right">
                      {result.xp > 0 ? (
                        <div className="flex items-center gap-1 text-xs">
                          <span>+{result.xp} XP</span>
                          {result.levelUp && (
                            <div className="bg-yellow-400 text-black px-1 rounded text-[10px]">LEVEL UP!</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No XP gained</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Rewards Section */}
          <div>
            <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Rewards Earned
            </h3>
            <Card className="bg-black/30 border border-white/10">
              <CardContent className="p-3 space-y-2">
                <AnimatePresence>
                  {/* Blueprint Reward */}
                  {blueprintRewards && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-400" />
                        <div>
                          <div className="text-sm">
                            {HOLOBOT_STATS[blueprintRewards.holobotKey]?.name || "Unknown"} Blueprint
                          </div>
                          <div className="text-xs text-muted-foreground">Blueprint pieces</div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-purple-400">
                        +{blueprintRewards.amount}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Holos Reward */}
                  {holosRewards > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 text-yellow-400">$</div>
                        <div>
                          <div className="text-sm">Holos Tokens</div>
                          <div className="text-xs text-muted-foreground">Game currency</div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-yellow-400">
                        +{holosRewards}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Gacha Tickets Reward */}
                  {gachaTickets > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-green-400" />
                        <div>
                          <div className="text-sm">Gacha Tickets</div>
                          <div className="text-xs text-muted-foreground">For Holobot summons</div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-green-400">
                        +{gachaTickets}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* No Rewards Message */}
                  {!blueprintRewards && holosRewards <= 0 && (!gachaTickets || gachaTickets <= 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-2 text-muted-foreground"
                    >
                      No rewards earned this time
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
          
          {/* Close Button */}
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={onClose}
              className="bg-holobots-accent hover:bg-holobots-hover text-white w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
