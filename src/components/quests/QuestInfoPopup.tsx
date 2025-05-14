import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Trophy, Star, FileText, Info, Gem, Ticket } from "lucide-react";
import { BLUEPRINT_TIERS } from "@/components/holobots/BlueprintSection";
import { useAuth } from "@/contexts/auth";

export function QuestInfoPopup() {
  const { user } = useAuth();
  
  // Calculate total blueprints collected
  const totalBlueprints = user?.blueprints 
    ? Object.values(user.blueprints).reduce((sum, count) => sum + count, 0)
    : 0;
    
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 border-cyan-500/20 bg-black/40 text-cyan-400 flex items-center gap-1">
          <Info className="h-4 w-4" />
          <span>Quest Info</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron italic">Quest Information</DialogTitle>
          <DialogDescription>
            <div className="mt-4 space-y-4">
              {/* XP Info Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Trophy className="h-4 w-4 text-yellow-400" />
                  <h3>Experience Points</h3>
                </div>
                <p className="text-gray-200 text-sm">
                  All Holobots in your boss battle squad now earn XP! Higher difficulty battles award more XP.
                </p>
                <div className="flex justify-between items-center mt-2 text-xs text-white">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    Tier 1
                    <span className="text-cyan-400">50 XP</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    Tier 2
                    <span className="text-cyan-400">100 XP</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    Tier 3
                    <span className="text-cyan-400">200 XP</span>
                  </span>
                </div>
              </div>
              
              {/* Rewards Info Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Gem className="h-4 w-4 text-yellow-400" />
                  <h3>Quest Rewards</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-white">
                  <div>
                    <h4 className="font-semibold text-red-400">Exploration</h4>
                    <ul className="list-disc list-inside text-xs space-y-1 text-gray-200">
                      <li>Blueprint pieces: 1-3</li>
                      <li>HOLOS tokens: 50-200</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400">Boss Battles</h4>
                    <ul className="list-disc list-inside text-xs space-y-1 text-gray-200">
                      <li>Blueprint pieces: 5-15</li>
                      <li>HOLOS tokens: 1000-5000</li>
                      <li>Gacha tickets: 5-15</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Blueprint Info Section */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <h3>Blueprint Collection</h3>
                </div>
                <p className="text-sm text-gray-200 mb-2">
                  Total Blueprints: <span className="text-cyan-400 font-bold">{totalBlueprints}</span>
                </p>
                
                <div className="grid grid-cols-5 gap-1 text-center">
                  {Object.entries(BLUEPRINT_TIERS).map(([key, tier]) => (
                    <div 
                      key={key}
                      className="p-1 rounded text-[10px] border border-cyan-500/20 bg-black/20 text-white"
                    >
                      {tier.name} ({tier.required})
                    </div>
                  ))}
                </div>
                
                <p className="mt-2 text-[10px] text-gray-200">
                  Collect blueprints from Quests to mint new Holobots!
                </p>
              </div>
              
              {/* Cooldown Info */}
              <div className="p-3 bg-black/40 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                  <Ticket className="h-4 w-4 text-yellow-400" />
                  <h3>Holobot Cooldown</h3>
                </div>
                <p className="text-sm text-gray-200">
                  Each Holobot has a 30-minute cooldown period after completing a quest before they can be sent on another adventure.
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
} 