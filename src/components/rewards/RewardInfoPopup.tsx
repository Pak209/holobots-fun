import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Trophy, Star, Calendar, Target, Zap, Info, Ticket } from "lucide-react";

export function RewardInfoPopup() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 border-cyan-500/20 bg-black/40 text-cyan-400 flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>How to Earn</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron italic">How to Earn Rewards</DialogTitle>
          <DialogDescription>
            <div className="mt-4 space-y-4">
              {/* Daily Missions Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <h3>Daily Missions</h3>
                </div>
                <p className="text-gray-200 text-sm mb-2">
                  Complete daily challenges to earn 1-3 Gacha Tickets per day. New missions reset daily.
                </p>
                <div className="flex items-center gap-1 text-xs text-cyan-400">
                  <Ticket className="h-3 w-3" />
                  <span>Reward: 1-3 Gacha Tickets/day</span>
                </div>
              </div>
              
              {/* Training Streaks Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Target className="h-4 w-4 text-green-400" />
                  <h3>Sync Training Streaks</h3>
                </div>
                <p className="text-gray-200 text-sm mb-2">
                  Maintain training streaks for bonus rewards. Sync your fitness data daily for streak bonuses.
                </p>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <Ticket className="h-3 w-3" />
                  <span>Reward: 5 Tickets/week bonus</span>
                </div>
              </div>
              
              {/* Arena Win Streaks Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Trophy className="h-4 w-4 text-red-400" />
                  <h3>Arena Win Streaks</h3>
                </div>
                <p className="text-gray-200 text-sm mb-2">
                  Win consecutive arena battles to earn escalating rewards. Higher streaks = bigger rewards!
                </p>
                <div className="flex items-center gap-1 text-xs text-red-400">
                  <Ticket className="h-3 w-3" />
                  <span>Reward: 5-25 Tickets per streak</span>
                </div>
              </div>
              
              {/* League Victories Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <h3>League Victories</h3>
                </div>
                <p className="text-gray-200 text-sm mb-2">
                  Advance through league tiers for massive rewards. Each tier completion grants big bonuses.
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-400">
                  <Ticket className="h-3 w-3" />
                  <span>Reward: 10-25 Tickets + Holos per tier</span>
                </div>
              </div>
              
              {/* Additional Info */}
              <div className="p-3 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-1 text-cyan-400 font-semibold">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <h3>Pro Tips</h3>
                </div>
                <ul className="text-xs text-gray-200 space-y-1">
                  <li>• Complete daily missions for consistent rewards</li>
                  <li>• Maintain training streaks for weekly bonuses</li>
                  <li>• Focus on arena battles for quick ticket gains</li>
                  <li>• Progress through leagues for the biggest rewards</li>
                </ul>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 