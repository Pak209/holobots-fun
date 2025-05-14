import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";
import { HOLOBOT_STATS } from "@/types/holobot";
import type { HolobotStats } from "@/types/holobot";
import { HolobotCard } from "@/components/HolobotCard";
import { ExperienceBar } from "@/components/ExperienceBar";
import { getExperienceProgress } from "@/utils/battleUtils";
import { Gem, Award, Trophy, Star, Sword, Shield, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { getHolobotImagePath } from "@/utils/holobotImageUtils";

// Arena tier definitions
const ARENA_TIERS = {
  tutorial: {
    level: 1,
    entryFee: 50,
    rewards: {
      items: {
        energy_refills: 1,
        exp_boosters: 0,
        rank_skips: 0
      }
    }
  },
  tier1: {
    level: 5,
    entryFee: 50,
    rewards: {
      items: {
        energy_refills: 2,
        exp_boosters: 1,
        rank_skips: 0
      }
    }
  },
  tier2: {
    level: 20,
    entryFee: 50,
    rewards: {
      items: {
        energy_refills: 3,
        exp_boosters: 2,
        rank_skips: 0
      }
    }
  },
  tier3: {
    level: 40,
    entryFee: 100,
    rewards: {
      holosTokens: 200,
      items: {
        energy_refills: 4,
        exp_boosters: 3,
        rank_skips: 1
      }
    }
  }
} as const;

interface ArenaSpecificItemRewards {
  energy_refills: number;
  exp_boosters: number;
  rank_skips: number;
  // Add gacha_tickets and arena_passes if they can also come from here,
  // though they are currently handled by calculateArenaRewards
}

interface ArenaPrebattleMenuProps {
  onHolobotSelect: (holobotKey: string) => void;
  onEntryFeeMethod: (
    method: 'tokens' | 'pass',
    selectedHolobot: string,
    opponentHolobots: string[],
    opponentLevel: number,
    specificItemRewards: ArenaSpecificItemRewards
  ) => void;
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
  const [selectedTier, setSelectedTier] = useState<keyof typeof ARENA_TIERS>("tutorial");
  const [currentRound, setCurrentRound] = useState(1);
  const [opponentHolobots, setOpponentHolobots] = useState<string[]>([]);

  useEffect(() => {
    if (user?.holobots && Array.isArray(user.holobots)) {
      setUserHolobots(user.holobots);
      
      // Auto-select the first holobot if available
      if (user.holobots.length > 0 && !selectedHolobot) {
        const firstHolobot = user.holobots[0];
        const holobotKey = getHolobotKeyByName(firstHolobot.name);
        setSelectedHolobot(holobotKey);
        onHolobotSelect(holobotKey);
      }
    }
  }, [user, selectedHolobot, onHolobotSelect]);

  // Generate random opponent for each round
  useEffect(() => {
    const availableHolobots = Object.keys(HOLOBOT_STATS);
    const newOpponents = [];
    for (let i = 0; i < 3; i++) {
      let randomKey = availableHolobots[Math.floor(Math.random() * availableHolobots.length)];
      // Ensure no duplicate holobots in a single lineup
      while (newOpponents.includes(randomKey)) {
        randomKey = availableHolobots[Math.floor(Math.random() * availableHolobots.length)];
      }
      newOpponents.push(randomKey);
    }
    setOpponentHolobots(newOpponents);
  }, [selectedTier]);

  // Get the holobot key from HOLOBOT_STATS based on name
  const getHolobotKeyByName = (name: string): string => {
    const lowerName = name.toLowerCase();
    const key = Object.keys(HOLOBOT_STATS).find(
      k => HOLOBOT_STATS[k].name.toLowerCase() === lowerName
    );
    return key || Object.keys(HOLOBOT_STATS)[0];
  };

  // Apply attribute boosts to base stats
  const applyAttributeBoosts = (baseStats, userHolobot) => {
    if (!userHolobot || !userHolobot.boostedAttributes) return baseStats;
    
    return {
      ...baseStats,
      attack: baseStats.attack + (userHolobot.boostedAttributes.attack || 0),
      defense: baseStats.defense + (userHolobot.boostedAttributes.defense || 0),
      speed: baseStats.speed + (userHolobot.boostedAttributes.speed || 0),
      maxHealth: baseStats.maxHealth + (userHolobot.boostedAttributes.health || 0)
    };
  };

  const handleHolobotSelect = (holobotKey: string) => {
    setSelectedHolobot(holobotKey);
    onHolobotSelect(holobotKey);
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
    onEntryFeeMethod('tokens', selectedHolobot, opponentHolobots, ARENA_TIERS[selectedTier].level, ARENA_TIERS[selectedTier].rewards.items);
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
    onEntryFeeMethod('pass', selectedHolobot, opponentHolobots, ARENA_TIERS[selectedTier].level, ARENA_TIERS[selectedTier].rewards.items);
  };

  // Helper to get user holobot by key
  const getUserHolobotByKey = (key: string) => userHolobots.find(h => getHolobotKeyByName(h.name) === key);

  return (
    <Card className="border border-holobots-border bg-[#1A1F2C]">
      <CardHeader>
        <CardTitle className="text-center text-2xl text-white font-orbitron italic">Arena Battle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          {/* First Row: Holobot Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Holobot Selection */}
            <div className="flex flex-col">
              <h3 className="text-red-400 mb-2 text-center md:text-left font-orbitron italic">Select Your Holobot</h3>
              <Select value={selectedHolobot || undefined} onValueChange={handleHolobotSelect}>
                <SelectTrigger className="w-full bg-[#1A1F2C] text-white border-holobots-border">
                  {selectedHolobot ? (
                    (() => {
                      const userHolobot = getUserHolobotByKey(selectedHolobot);
                      const baseStats: Partial<HolobotStats> = HOLOBOT_STATS[selectedHolobot] || {};
                      const boosts = userHolobot?.boostedAttributes || {};
                      return (
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-8 w-8 border border-cyan-400">
                            <AvatarImage src={getHolobotImagePath(userHolobot?.name || selectedHolobot)} alt={userHolobot?.name || selectedHolobot} />
                            <AvatarFallback>{(userHolobot?.name || selectedHolobot).slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-white mr-2">{userHolobot?.name} <span className="text-cyan-300">Lv.{userHolobot?.level}</span></span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Sword className="h-4 w-4 text-red-400" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">{baseStats.attack !== undefined ? baseStats.attack + (boosts.attack || 0) : '-'}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">{baseStats.defense !== undefined ? baseStats.defense + (boosts.defense || 0) : '-'}</span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Zap className="h-4 w-4 text-yellow-300" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">{baseStats.speed !== undefined ? baseStats.speed + (boosts.speed || 0) : '-'}</span>
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    <SelectValue placeholder="Choose your Holobot" />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-holobots-card border-holobots-border">
                  {userHolobots.map((holobot, index) => {
                    const holobotKey = getHolobotKeyByName(holobot.name);
                    return (
                      <SelectItem key={holobotKey} value={holobotKey} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 mr-2 border border-cyan-400">
                          <AvatarImage src={getHolobotImagePath(holobot.name)} alt={holobot.name} />
                          <AvatarFallback>{holobot.name.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {holobot.name} (Lv.{holobot.level})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Opponents Header */}
            <div className="flex flex-col">
              <h4 className="text-red-400 mb-2 text-center md:text-left font-orbitron italic">Your Opponents</h4>
            </div>
          </div>

          {/* Second Row: Battle Preview with VS in the middle */}
          <div className="flex flex-row items-center justify-between">
            {/* User's Holobot */}
            <div className="flex-1 flex justify-center">
              {selectedHolobot && (
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 border-4 border-cyan-400 shadow-lg">
                    <AvatarImage src={getHolobotImagePath(getUserHolobotByKey(selectedHolobot)?.name || selectedHolobot)} alt={getUserHolobotByKey(selectedHolobot)?.name || selectedHolobot} />
                    <AvatarFallback>{getUserHolobotByKey(selectedHolobot)?.name?.slice(0,2).toUpperCase() || "??"}</AvatarFallback>
                  </Avatar>
                  <div className="text-center text-base text-holobots-accent mt-1 font-semibold">
                    {getUserHolobotByKey(selectedHolobot)?.name} (Lv.{getUserHolobotByKey(selectedHolobot)?.level})
                  </div>
                </div>
              )}
            </div>

            {/* VS Component */}
            <div className="flex flex-col items-center mx-4">
              <div className="text-holobots-accent font-bold text-xl">VS</div>
              <div className="text-sm text-gray-400">3 Rounds</div>
            </div>

            {/* Opponents */}
            <div className="flex-1 flex justify-center">
              <div className="flex flex-col items-center">
                <div className="flex gap-2 justify-center">
                  {opponentHolobots.map((opponentKey, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <Avatar className="h-12 w-12 border-2 border-red-400">
                        <AvatarImage src={getHolobotImagePath(HOLOBOT_STATS[opponentKey].name)} alt={HOLOBOT_STATS[opponentKey].name} />
                        <AvatarFallback>{HOLOBOT_STATS[opponentKey].name.slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="text-center text-xs text-red-400 mt-1">Round {idx + 1}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 text-center mt-1">Face a new random Holobot each round</div>
              </div>
            </div>
          </div>

          {/* Third Row: Payment Options */}
          <div className="flex flex-col md:flex-row gap-4 w-full border-t border-gray-700 pt-4">
            <div className="flex-1">
              <p className="text-[#8E9196] mb-2 text-center">Entry fee: {ARENA_TIERS[selectedTier].entryFee} Holos tokens</p>
              <p className="text-[#8E9196] mb-4 text-center">Your balance: {user?.holosTokens || 0} Holos</p>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-gray-700 md:pl-4 pt-4 md:pt-0 flex-1">
              <p className="text-[#8E9196] mb-2 text-center">Your Arena Passes: {user?.arena_passes || 0}</p>
            </div>
          </div>
          
          {/* Payment Buttons Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              onClick={handlePayWithTokens}
              disabled={!user || user.holosTokens < ARENA_TIERS[selectedTier].entryFee || !selectedHolobot}
              className="flex-1 bg-holobots-accent hover:bg-holobots-hover text-white py-2"
            >
              <Gem className="mr-2 h-4 w-4" />
              Pay Entry Fee
            </Button>
            
            <Button
              onClick={handleUseArenaPass}
              disabled={!user || !user.arena_passes || user.arena_passes <= 0 || !selectedHolobot}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2"
            >
              <Award className="mr-2 h-4 w-4" />
              Use Arena Pass
            </Button>
          </div>

          {/* Fourth Row: Tier Selection - Compact Version */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-holobots-accent mb-2 text-center font-orbitron">Select Arena Tier</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(ARENA_TIERS) as [keyof typeof ARENA_TIERS, typeof ARENA_TIERS[keyof typeof ARENA_TIERS]][]).map(([key, tier]) => (
                <div 
                  key={key}
                  className={`
                    flex justify-between items-center p-2 rounded-lg cursor-pointer border
                    ${selectedTier === key 
                      ? 'bg-holobots-accent bg-opacity-20 border-holobots-accent' 
                      : 'bg-black/40 border-holobots-border hover:border-holobots-accent/50'}
                  `}
                  onClick={() => setSelectedTier(key)}
                >
                  {/* Tier Info */}
                  <div className="flex items-center gap-2">
                    <div className={`
                      p-1.5 rounded-full 
                      ${selectedTier === key ? 'bg-holobots-accent text-white' : 'bg-gray-800 text-holobots-accent'}
                    `}>
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white capitalize">{key}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Lv.{tier.level}+</span>
                        <span className="text-xs font-medium text-yellow-400">{tier.entryFee} Holos</span>
                      </div>
                    </div>
                  </div>

                  {/* Tier Rewards - Compact */}
                  <div className="flex items-center gap-1 text-xs">
                    {'holosTokens' in tier.rewards && tier.rewards.holosTokens && tier.rewards.holosTokens > 0 && (
                      <div className="flex items-center mr-1">
                        <Gem className="h-3 w-3 text-yellow-400 mr-0.5" />
                        <span className="text-yellow-400 font-medium">{tier.rewards.holosTokens}</span>
                      </div>
                    )}
                    {tier.rewards.items.energy_refills > 0 && (
                    <div className="flex items-center mr-1">
                      <Star className="h-3 w-3 text-white mr-0.5" /> {/* Assuming Energy Refill is common display */}
                      <span className="text-white">ER x{tier.rewards.items.energy_refills}</span>
                    </div>
                    )}
                    {tier.rewards.items.exp_boosters > 0 && (
                    <div className="flex items-center mr-1">
                      <Star className="h-3 w-3 text-blue-400 mr-0.5" /> {/* Assuming EXP Booster is rare display */}
                      <span className="text-blue-400">EB x{tier.rewards.items.exp_boosters}</span>
                    </div>
                    )}
                    {tier.rewards.items.rank_skips > 0 && (
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-purple-400 mr-0.5" /> {/* Assuming Rank Skip is legendary display */}
                      <span className="text-purple-400">RS x{tier.rewards.items.rank_skips}</span>
                    </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
