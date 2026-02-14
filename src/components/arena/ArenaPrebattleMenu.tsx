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
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { useSyncPointsStore } from "@/stores/syncPointsStore";

// Arena tier definitions
const ARENA_TIERS = {
  tutorial: {
    level: 1,
    entryFee: 50,
    tierNumber: 0,
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
    entryFee: 100,
    tierNumber: 1,
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
    entryFee: 125,
    tierNumber: 2,
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
    entryFee: 150,
    tierNumber: 3,
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
  const { getEquippedParts } = useHolobotPartsStore();
  const { getHolobotAttributeLevel } = useSyncPointsStore();
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
    const tierNumber = ARENA_TIERS[selectedTier].tierNumber;
    onEntryFeeMethod('tokens', selectedHolobot, opponentHolobots, ARENA_TIERS[selectedTier].level, ARENA_TIERS[selectedTier].rewards.items, tierNumber);
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
    const tierNumber = ARENA_TIERS[selectedTier].tierNumber;
    onEntryFeeMethod('pass', selectedHolobot, opponentHolobots, ARENA_TIERS[selectedTier].level, ARENA_TIERS[selectedTier].rewards.items, tierNumber);
  };

  // Helper to get user holobot by key
  const getUserHolobotByKey = (key: string) => userHolobots.find(h => getHolobotKeyByName(h.name) === key);

  return (
    <Card className="border-4 border-[#F5C400] bg-black relative z-20 shadow-[0_0_30px_rgba(245,196,0,0.3)]" style={{
      clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
    }}>
      <CardHeader className="py-2 sm:py-3 bg-gradient-to-r from-[#F5C400] to-[#D4A400] relative" style={{
        clipPath: 'polygon(15px 0, 100% 0, 100% 100%, 0 100%, 0 15px)'
      }}>
        <CardTitle className="text-center text-lg sm:text-xl md:text-2xl text-black font-bold tracking-widest uppercase">Arena Battle</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="flex flex-col space-y-2 sm:space-y-3">
          {/* First Row: Holobot Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {/* User Holobot Selection */}
            <div className="flex flex-col">
              <h3 className="text-[#F5C400] mb-1.5 sm:mb-2 text-center md:text-left font-bold tracking-wider uppercase text-xs sm:text-sm border-b-2 border-[#F5C400] pb-1">Select Your Holobot</h3>
              <Select value={selectedHolobot || undefined} onValueChange={handleHolobotSelect}>
                <SelectTrigger className="w-full bg-black text-white border-2 border-[#F5C400]/50 hover:border-[#F5C400] transition-colors" style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}>
                  {selectedHolobot ? (
                    (() => {
                      const userHolobot = getUserHolobotByKey(selectedHolobot);
                      const baseStats: Partial<HolobotStats> = HOLOBOT_STATS[selectedHolobot] || {};
                      const boosts = userHolobot?.boostedAttributes || {};
                      
                      // Get parts bonuses
                      const equippedParts = getEquippedParts(baseStats.name || '');
                      const partsBonuses = { attack: 0, defense: 0, speed: 0 };
                      if (equippedParts) {
                        Object.values(equippedParts).forEach((part: any) => {
                          if (part?.baseStats) {
                            partsBonuses.attack += part.baseStats.attack || 0;
                            partsBonuses.defense += part.baseStats.defense || 0;
                            partsBonuses.speed += part.baseStats.speed || 0;
                          }
                        });
                      }
                      
                      // Get SP upgrade bonuses (2 points per level)
                      const holobotId = userHolobot?.name || baseStats.name || selectedHolobot;
                      const spBonuses = {
                        attack: getHolobotAttributeLevel(holobotId, 'attack') * 2,
                        defense: getHolobotAttributeLevel(holobotId, 'defense') * 2,
                        speed: getHolobotAttributeLevel(holobotId, 'speed') * 2,
                      };
                      
                      return (
                        <div className="flex items-center gap-2 w-full">
                          <Avatar className="h-8 w-8 border border-cyan-400">
                            <AvatarImage src={getHolobotImagePath(userHolobot?.name || selectedHolobot)} alt={userHolobot?.name || selectedHolobot} />
                            <AvatarFallback>{(userHolobot?.name || selectedHolobot).slice(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-white mr-2">{userHolobot?.name} <span className="text-cyan-300">Lv.{userHolobot?.level}</span></span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Sword className="h-4 w-4 text-red-400" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">
                              {baseStats.attack !== undefined ? baseStats.attack + (boosts.attack || 0) + partsBonuses.attack + spBonuses.attack : '-'}
                              {partsBonuses.attack > 0 && <span className="text-purple-400 text-[10px]"> (+{partsBonuses.attack})</span>}
                              {spBonuses.attack > 0 && <span className="text-green-400 text-[10px]"> (+{spBonuses.attack} SP)</span>}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Shield className="h-4 w-4 text-blue-400" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">
                              {baseStats.defense !== undefined ? baseStats.defense + (boosts.defense || 0) + partsBonuses.defense + spBonuses.defense : '-'}
                              {partsBonuses.defense > 0 && <span className="text-purple-400 text-[10px]"> (+{partsBonuses.defense})</span>}
                              {spBonuses.defense > 0 && <span className="text-green-400 text-[10px]"> (+{spBonuses.defense} SP)</span>}
                            </span>
                          </span>
                          <span className="flex items-center gap-1 text-xs text-white/80">
                            <Zap className="h-4 w-4 text-yellow-300" />
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">
                              {baseStats.speed !== undefined ? baseStats.speed + (boosts.speed || 0) + partsBonuses.speed + spBonuses.speed : '-'}
                              {partsBonuses.speed > 0 && <span className="text-purple-400 text-[10px]"> (+{partsBonuses.speed})</span>}
                              {spBonuses.speed > 0 && <span className="text-green-400 text-[10px]"> (+{spBonuses.speed} SP)</span>}
                            </span>
                          </span>
                        </div>
                      );
                    })()
                  ) : (
                    <SelectValue placeholder="Choose your Holobot" />
                  )}
                </SelectTrigger>
                <SelectContent className="bg-black border-3 border-[#F5C400] shadow-[0_0_20px_rgba(245,196,0,0.4)]">
                  {userHolobots.map((holobot, index) => {
                    const holobotKey = getHolobotKeyByName(holobot.name);
                    return (
                      <SelectItem key={holobotKey} value={holobotKey} className="flex items-center gap-2 text-white hover:bg-[#F5C400]/20 hover:text-[#F5C400] focus:bg-[#F5C400]/20 focus:text-[#F5C400] font-bold">
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
              <h4 className="text-[#F5C400] mb-1.5 sm:mb-2 text-center md:text-left font-bold tracking-wider uppercase text-xs sm:text-sm border-b-2 border-[#F5C400] pb-1">Your Opponents</h4>
            </div>
          </div>

          {/* Second Row: Battle Preview with VS in the middle - More Compact */}
          <div className="flex flex-row items-center justify-between bg-gradient-to-r from-gray-900 via-black to-gray-900 p-2 sm:p-3 md:p-4 border-2 border-gray-700" style={{
            clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
          }}>
            {/* User's Holobot */}
            <div className="flex-1 flex justify-center">
              {selectedHolobot && (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 border-3 border-[#F5C400] shadow-[0_0_15px_rgba(245,196,0,0.5)] bg-black">
                      <AvatarImage src={getHolobotImagePath(getUserHolobotByKey(selectedHolobot)?.name || selectedHolobot)} alt={getUserHolobotByKey(selectedHolobot)?.name || selectedHolobot} />
                      <AvatarFallback className="bg-gray-900 text-[#F5C400] font-bold text-xs">{getUserHolobotByKey(selectedHolobot)?.name?.slice(0,2).toUpperCase() || "??"}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center text-[10px] sm:text-xs text-[#F5C400] mt-1 font-bold uppercase">
                    {getUserHolobotByKey(selectedHolobot)?.name}
                  </div>
                </div>
              )}
            </div>

            {/* VS Component - Smaller */}
            <div className="flex flex-col items-center mx-2 sm:mx-3 bg-[#F5C400] text-black px-3 py-1.5 sm:px-4 sm:py-2 border-2 border-black shadow-[0_0_10px_rgba(245,196,0,0.6)]" style={{
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
            }}>
              <div className="font-black text-lg sm:text-xl md:text-2xl tracking-widest">VS</div>
              <div className="text-[8px] sm:text-[9px] font-bold uppercase">3 Rounds</div>
            </div>

            {/* Opponents - Smaller */}
            <div className="flex-1 flex justify-center">
              <div className="flex gap-1 sm:gap-2 justify-center">
                {opponentHolobots.map((opponentKey, idx) => (
                  <div key={idx} className="relative">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] bg-black">
                      <AvatarImage src={getHolobotImagePath(HOLOBOT_STATS[opponentKey].name)} alt={HOLOBOT_STATS[opponentKey].name} />
                      <AvatarFallback className="bg-gray-900 text-red-500 font-bold text-[10px]">{HOLOBOT_STATS[opponentKey].name.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center border border-black">
                      R{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Third Row: Payment Options - More Compact */}
          <div className="flex flex-col md:flex-row gap-2 sm:gap-3 w-full">
            <div className="flex-1 bg-gradient-to-br from-gray-900 to-black border-2 border-[#F5C400]/50 p-2 sm:p-3" style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
            }}>
              <div className="text-[#F5C400] mb-1 text-center text-[10px] font-bold uppercase tracking-wider">Entry Fee</div>
              <div className="text-white text-center text-xl sm:text-2xl font-black mb-0.5">
                <Gem className="inline h-4 w-4 sm:h-5 sm:w-5 text-[#F5C400] mr-1" />
                {ARENA_TIERS[selectedTier].entryFee}
              </div>
              <div className="text-gray-400 text-center text-[10px] uppercase">Balance: <span className="text-white font-bold">{user?.holosTokens || 0}</span></div>
            </div>
            
            <div className="flex-1 bg-gradient-to-br from-gray-900 to-black border-2 border-[#F5C400]/50 p-2 sm:p-3" style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
            }}>
              <div className="text-[#F5C400] mb-1 text-center text-[10px] font-bold uppercase tracking-wider">Arena Passes</div>
              <div className="text-white text-center text-xl sm:text-2xl font-black mb-0.5">
                <Award className="inline h-4 w-4 sm:h-5 sm:w-5 text-[#F5C400] mr-1" />
                {user?.arena_passes || 0}
              </div>
              <div className="text-gray-400 text-center text-[10px] uppercase">Available</div>
            </div>
          </div>
          
          {/* Payment Buttons Row - More Compact */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              onClick={handlePayWithTokens}
              disabled={!user || user.holosTokens < ARENA_TIERS[selectedTier].entryFee || !selectedHolobot}
              className="flex-1 bg-[#F5C400] hover:bg-[#D4A400] disabled:bg-gray-700 disabled:text-gray-500 text-black font-black py-3 sm:py-4 text-sm sm:text-base uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(245,196,0,0.5)] hover:shadow-[0_0_20px_rgba(245,196,0,0.8)] transition-all disabled:shadow-none"
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}
            >
              <Gem className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Pay Entry Fee
            </Button>
            
            <Button
              onClick={handleUseArenaPass}
              disabled={!user || !user.arena_passes || user.arena_passes <= 0 || !selectedHolobot}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white font-black py-3 sm:py-4 text-sm sm:text-base uppercase tracking-widest border-3 border-black shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.8)] transition-all disabled:shadow-none"
              style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}
            >
              <Award className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Use Arena Pass
            </Button>
          </div>

          {/* Fourth Row: Tier Selection - Horizontal Scrollable */}
          <div className="border-t-2 border-[#F5C400]/30 pt-2 sm:pt-3">
            <h3 className="text-[#F5C400] mb-2 text-center font-black text-sm sm:text-base uppercase tracking-widest">Select Arena Tier</h3>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#F5C400] scrollbar-track-gray-800">
              {(Object.entries(ARENA_TIERS) as [keyof typeof ARENA_TIERS, typeof ARENA_TIERS[keyof typeof ARENA_TIERS]][]).map(([key, tier]) => (
                <div 
                  key={key}
                  className={`
                    flex-shrink-0 w-40 sm:w-48 flex flex-col justify-between p-2 sm:p-3 cursor-pointer border-2 transition-all
                    ${selectedTier === key 
                      ? 'bg-gradient-to-br from-[#F5C400]/20 to-[#F5C400]/10 border-[#F5C400] shadow-[0_0_12px_rgba(245,196,0,0.4)]' 
                      : 'bg-gradient-to-br from-gray-900 to-black border-gray-700 hover:border-gray-500'}
                  `}
                  style={{
                    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                  }}
                  onClick={() => setSelectedTier(key)}
                >
                  {/* Tier Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`
                      p-1.5 
                      ${selectedTier === key ? 'bg-[#F5C400] text-black' : 'bg-gray-800 text-gray-400'}
                    `} style={{
                      clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                    }}>
                      <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-black uppercase ${selectedTier === key ? 'text-[#F5C400]' : 'text-white'}`}>{key}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase">Lv.{tier.level}+</span>
                      </div>
                    </div>
                  </div>

                  {/* Entry Fee */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1">
                      <Gem className="h-3 w-3 text-[#F5C400]" />
                      <span className="text-sm sm:text-base font-bold text-[#F5C400]">{tier.entryFee}</span>
                      <span className="text-[9px] text-gray-400">Holos</span>
                    </div>
                  </div>

                  {/* Tier Rewards */}
                  <div className="flex flex-wrap gap-1 text-[9px] sm:text-[10px]">
                    {'holosTokens' in tier.rewards && tier.rewards.holosTokens && tier.rewards.holosTokens > 0 && (
                      <div className="flex items-center bg-[#F5C400]/10 px-1.5 py-0.5 rounded">
                        <Gem className="h-2.5 w-2.5 text-[#F5C400] mr-0.5" />
                        <span className="text-[#F5C400] font-bold">{tier.rewards.holosTokens}</span>
                      </div>
                    )}
                    {tier.rewards.items.energy_refills > 0 && (
                      <div className="flex items-center bg-white/10 px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 text-white mr-0.5" />
                        <span className="text-white">ER×{tier.rewards.items.energy_refills}</span>
                      </div>
                    )}
                    {tier.rewards.items.exp_boosters > 0 && (
                      <div className="flex items-center bg-blue-400/10 px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 text-blue-400 mr-0.5" />
                        <span className="text-blue-400">EB×{tier.rewards.items.exp_boosters}</span>
                      </div>
                    )}
                    {tier.rewards.items.rank_skips > 0 && (
                      <div className="flex items-center bg-purple-400/10 px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 text-purple-400 mr-0.5" />
                        <span className="text-purple-400">RS×{tier.rewards.items.rank_skips}</span>
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
