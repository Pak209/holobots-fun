import { useState } from "react";
import { HolobotCard } from "@/components/HolobotCard";
import { HOLOBOT_STATS, getRank } from "@/types/holobot";
import { Button } from "@/components/ui/button";
import { Coins, Plus, Crown, Zap, Sword, Shield, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserHolobot } from "@/types/user";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Part, PartSlot } from "@/types/holobotParts";
// Parts icons will be rendered as img tags instead of components

interface HolobotFlipCardProps {
  holobotKey: string;
  holobot: typeof HOLOBOT_STATS[keyof typeof HOLOBOT_STATS];
  userHolobot: UserHolobot | undefined;
  userTokens: number;
  isMinting: boolean;
  justMinted: boolean;
  onMint: (holobotName: string) => void;
}

export const HolobotFlipCard = ({
  holobotKey,
  holobot,
  userHolobot,
  userTokens,
  isMinting,
  justMinted,
  onMint
}: HolobotFlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<PartSlot | null>(null);
  const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);
  
  const isOwned = !!userHolobot;
  const level = userHolobot?.level || holobot.level;
  const currentXp = userHolobot?.experience || 0;
  const nextLevelXp = userHolobot?.nextLevelExp || 100;
  const holobotRank = userHolobot?.rank || "Common";
  const attributePoints = userHolobot?.attributePoints || 0;

  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const { getEquippedParts, getAvailableInventoryBySlot, equipPart, unequipPart } = useHolobotPartsStore();

  const calculateProgress = (current: number, total: number) => {
    return Math.min(100, Math.floor((current / total) * 100));
  };

  const xpProgress = calculateProgress(currentXp, nextLevelXp);

  // Calculate parts bonuses
  const getPartsBonuses = () => {
    if (!isOwned) return { attack: 0, defense: 0, speed: 0, intelligence: 0 };
    
    const equippedParts = getEquippedParts(holobot.name);
    const bonuses = { attack: 0, defense: 0, speed: 0, intelligence: 0 };
    
    Object.values(equippedParts).forEach(part => {
      if (part) {
        bonuses.attack += part.baseStats.attack;
        bonuses.defense += part.baseStats.defense;
        bonuses.speed += part.baseStats.speed;
        bonuses.intelligence += part.baseStats.intelligence;
      }
    });
    
    return bonuses;
  };

  const partsBonuses = getPartsBonuses();

  const getRankColor = (rank: string) => {
    switch(rank) {
      case "Legendary": return "bg-orange-600/20 border-orange-500 text-orange-400";
      case "Elite": return "bg-yellow-600/20 border-yellow-500 text-yellow-400";
      case "Rare": return "bg-purple-600/20 border-purple-500 text-purple-400";
      case "Champion": return "bg-green-600/20 border-green-500 text-green-400";
      case "Common":
      default: return "bg-blue-600/20 border-blue-500 text-blue-400";
    }
  };

  const handleBoostAttribute = async (attribute: 'attack' | 'defense' | 'speed' | 'health') => {
    if (!isOwned || !user) return;
    
    try {
      if (!user.holobots || !Array.isArray(user.holobots)) {
        throw new Error("User holobots data is not available");
      }
      
      const targetHolobot = user.holobots.find(h => h.name.toLowerCase() === holobot.name.toLowerCase());
      if (!targetHolobot || !(targetHolobot.attributePoints && targetHolobot.attributePoints > 0)) {
        toast({
          title: "No Attribute Points",
          description: "You don't have any attribute points to spend.",
          variant: "destructive"
        });
        return;
      }
      
      const updatedHolobots = user.holobots.map(h => {
        if (h.name.toLowerCase() === holobot.name.toLowerCase()) {
          const boostedAttributes = h.boostedAttributes || {};
          
          if (attribute === 'health') {
            boostedAttributes.health = (boostedAttributes.health || 0) + 10;
          } else {
            boostedAttributes[attribute] = (boostedAttributes[attribute] || 0) + 1;
          }
          
          return {
            ...h,
            boostedAttributes,
            attributePoints: (h.attributePoints || 0) - 1
          };
        }
        return h;
      });
      
      await updateUser({ holobots: updatedHolobots });
      
      toast({
        title: "Attribute Boosted",
        description: `Increased ${attribute} for ${holobot.name}`,
      });
    } catch (error) {
      console.error("Error boosting attribute:", error);
      toast({
        title: "Error",
        description: "Failed to boost attribute",
        variant: "destructive"
      });
    }
  };

  const partSlots: PartSlot[] = ['head', 'torso', 'arms', 'legs', 'core'];
  const equippedParts = getEquippedParts(holobot.name);
  const availablePartsForSlot = selectedSlot ? getAvailableInventoryBySlot(selectedSlot) : [];

  const slotNames = {
    head: "HEAD",
    torso: "TORSO",
    arms: "ARMS",
    legs: "LEGS",
    core: "CORE",
  };

  // Mapping of part names to their PNG images
  const getPartImage = (partName: string): string | null => {
    // Remove tier suffix if present (e.g., "Quantum Core (Epic)" -> "Quantum Core")
    const basePartName = partName.replace(/\s*\([^)]*\)\s*$/i, '').trim();
    
    const partImages: Record<string, string> = {
      // Arms parts
      'Plasma Cannon': '/icons/ArmPartPlasmaCannon.png',
      'Plasma Cannons': '/icons/ArmPartPlasmaCannon.png',
      'Boxer Gloves': '/icons/ArmsPartBoxer.png',
      'Inferno Claws': '/icons/ArmsPartInfernoClaws.png',
      // Head parts
      'Combat Mask': '/icons/HeadPartCombatMask.png',
      'Void Mask': '/icons/HeadPartVoidMask.png',
      'Advanced Scanner': '/icons/HeadPartCombatMask.png',
      // Torso parts
      'Titanium Torso': '/icons/TorsoPart.png',
      'Steel Torso': '/icons/TorsoPart.png',
      'Reinforced Chassis': '/icons/TorsoPart.png',
      // Legs parts
      'Power Legs': '/icons/LegPart.png',
      'Speed Legs': '/icons/LegPart.png',
      'Turbo Boosters': '/icons/LegPart.png',
      // Core parts
      'Energy Core': '/icons/CorePart.png',
      'Power Core': '/icons/CorePart.png',
      'Quantum Core': '/icons/CorePart.png',
    };
    
    return partImages[basePartName] || null;
  };

  const handleSlotClick = (slot: PartSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwned) {
      toast({
        title: "Holobot Not Owned",
        description: "You must own this Holobot to equip parts.",
        variant: "destructive"
      });
      return;
    }
    setSelectedSlot(slot);
    setIsEquipDialogOpen(true);
  };

  const handleEquipPart = async (part: Part) => {
    try {
      equipPart(holobot.name, part);
      
      if (user) {
        const currentEquipment = user.equippedParts?.[holobot.name] || {};
        const updatedEquipment = {
          ...currentEquipment,
          [part.slot]: part,
        };
        
        const updatedEquippedParts = {
          ...user.equippedParts,
          [holobot.name]: updatedEquipment
        };
        
        await updateUser({
          equippedParts: updatedEquippedParts
        });
      }
      
      setIsEquipDialogOpen(false);
      setSelectedSlot(null);
      
      toast({
        title: "Part Equipped!",
        description: `${part.name} has been equipped to ${holobot.name}'s ${part.slot}.`,
      });
    } catch (error) {
      toast({
        title: "Equipment Failed",
        description: "Failed to equip the part. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnequipPart = async (slot: PartSlot, e: React.MouseEvent) => {
    e.stopPropagation();
    const part = equippedParts[slot];
    if (!part) return;

    try {
      unequipPart(holobot.name, slot);
      
      if (user) {
        const currentEquipment = user.equippedParts?.[holobot.name] || {};
        const updatedEquipment = { ...currentEquipment };
        delete updatedEquipment[slot];
        
        const updatedEquippedParts = {
          ...user.equippedParts,
          [holobot.name]: updatedEquipment
        };
        
        await updateUser({
          equippedParts: updatedEquippedParts
        });
      }
      
      toast({
        title: "Part Unequipped!",
        description: `${part.name} has been removed from ${holobot.name}'s ${slot}.`,
      });
    } catch (error) {
      toast({
        title: "Unequip Failed",
        description: "Failed to unequip the part. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[320px]" style={{ perspective: '1000px' }}>
      <div 
        className={`relative transition-transform duration-700 cursor-pointer`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT: TCG Card */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div className="bg-gradient-to-b from-black via-gray-900 to-black border-4 border-[#F5C400] p-4 rounded-lg shadow-[0_0_30px_rgba(245,196,0,0.3)] min-h-[450px] flex flex-col" style={{
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
          }}>
            <div className="flex justify-center mb-3">
              <HolobotCard 
                stats={{
                  ...holobot,
                  level: isOwned ? level : holobot.level,
                  experience: isOwned ? currentXp : undefined,
                  nextLevelExp: isOwned ? nextLevelXp : undefined,
                  name: holobot.name.toUpperCase(),
                  attack: holobot.attack + (userHolobot?.boostedAttributes?.attack || 0) + partsBonuses.attack,
                  defense: holobot.defense + (userHolobot?.boostedAttributes?.defense || 0) + partsBonuses.defense,
                  speed: holobot.speed + (userHolobot?.boostedAttributes?.speed || 0) + partsBonuses.speed,
                  maxHealth: holobot.maxHealth + (userHolobot?.boostedAttributes?.health || 0),
                }} 
                variant={isOwned ? "blue" : "red"} 
              />
            </div>

            {/* Parts Slots - 5 icons below card */}
            <div className="flex justify-center gap-2 mt-auto mb-2">
              {partSlots.map((slot) => {
                const equippedPart = equippedParts[slot];
                const partImageUrl = equippedPart ? getPartImage(equippedPart.name) : null;
                
                return (
                  <button 
                    key={slot} 
                    className={`relative w-10 h-10 transition-all ${isOwned ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'} ${equippedPart ? 'ring-2 ring-[#F5C400] shadow-[0_0_10px_rgba(245,196,0,0.6)]' : ''}`}
                    onClick={(e) => handleSlotClick(slot, e)}
                    title={equippedPart ? `${equippedPart.name} (Click to change)` : `Empty ${slot} slot (Click to equip)`}
                  >
                    {/* Background SVG */}
                    <img 
                      src="/icons/PartsBackground1.svg" 
                      alt="Part Slot" 
                      className="absolute inset-0 w-full h-full"
                    />
                    
                    {/* Show part PNG if equipped, otherwise show detail SVG */}
                    {partImageUrl ? (
                      <img 
                        src={partImageUrl}
                        alt={equippedPart.name}
                        className="absolute inset-0 w-full h-full p-1 object-contain z-10"
                      />
                    ) : (
                      <img 
                        src="/icons/PartsDetail1.svg" 
                        alt="Part Detail" 
                        className="absolute inset-0 w-full h-full opacity-50"
                      />
                    )}
                    
                    {/* Indicator dot if equipped */}
                    {equippedPart && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#F5C400] rounded-full border border-black z-20"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {!isOwned && !justMinted && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onMint(holobot.name);
                }}
                disabled={isMinting || userTokens < 100}
                className="w-full py-2 mt-2 bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-widest border-3 border-black"
                style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}
              >
                {isMinting ? (
                  "Minting..."
                ) : (
                  <>
                    <Plus size={16} className="mr-1" />
                    Mint
                    <Coins size={16} className="ml-2 mr-1" />
                    <span>100</span>
                  </>
                )}
              </Button>
            )}

            {justMinted && (
              <div className="w-full p-2 bg-green-500/20 border-2 border-green-500 rounded text-center mt-2">
                <span className="text-green-400 text-sm font-bold uppercase">Mint Successful!</span>
              </div>
            )}

            <p className="text-center text-[#F5C400] text-xs uppercase tracking-wider mt-2">
              Tap to view stats
            </p>
          </div>
        </div>

        {/* BACK: Stats & Boosts */}
        <div 
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="bg-gradient-to-b from-black via-gray-900 to-black border-4 border-[#F5C400] p-4 rounded-lg shadow-[0_0_30px_rgba(245,196,0,0.3)] min-h-[450px]" style={{
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
          }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F5C400] to-[#D4A400] p-2 mb-3" style={{
              clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
            }}>
              <h2 className="text-xl font-black text-black uppercase tracking-widest text-center">{holobot.name}</h2>
            </div>

            {isOwned && (
              <div className="space-y-3">
                {/* Level & Rank */}
                <div className="bg-black/60 p-3 border-2 border-[#F5C400]/50" style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#F5C400] font-bold uppercase text-sm">LV {level}</span>
                    <Badge className={`text-xs py-1 px-2 ${getRankColor(holobotRank)} font-bold border-2`}>
                      <Crown className="h-3 w-3 mr-1" /> {holobotRank}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>XP</span>
                      <span>{currentXp}/{nextLevelXp}</span>
                    </div>
                    <Progress value={xpProgress} className="h-2 bg-gray-700" />
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-black/60 p-3 border-2 border-[#F5C400]/50 space-y-2" style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}>
                  <h3 className="text-[#F5C400] font-black uppercase text-sm mb-2 border-b border-[#F5C400]/30 pb-1">Stats</h3>
                  <p className="text-white text-sm">HP: {holobot.maxHealth} 
                    {userHolobot?.boostedAttributes?.health ? <span className="text-blue-400"> +{userHolobot.boostedAttributes.health}</span> : ''}
                  </p>
                  <p className="text-white text-sm flex items-center gap-1">
                    <Sword className="h-3 w-3 text-red-400" />
                    Attack: {holobot.attack} 
                    {userHolobot?.boostedAttributes?.attack ? <span className="text-blue-400"> +{userHolobot.boostedAttributes.attack}</span> : ''}
                    {partsBonuses.attack > 0 ? <span className="text-purple-400"> +{partsBonuses.attack}</span> : ''}
                  </p>
                  <p className="text-white text-sm flex items-center gap-1">
                    <Shield className="h-3 w-3 text-blue-400" />
                    Defense: {holobot.defense} 
                    {userHolobot?.boostedAttributes?.defense ? <span className="text-blue-400"> +{userHolobot.boostedAttributes.defense}</span> : ''}
                    {partsBonuses.defense > 0 ? <span className="text-purple-400"> +{partsBonuses.defense}</span> : ''}
                  </p>
                  <p className="text-white text-sm flex items-center gap-1">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    Speed: {holobot.speed} 
                    {userHolobot?.boostedAttributes?.speed ? <span className="text-blue-400"> +{userHolobot.boostedAttributes.speed}</span> : ''}
                    {partsBonuses.speed > 0 ? <span className="text-purple-400"> +{partsBonuses.speed}</span> : ''}
                  </p>
                  <p className="text-sky-400 text-xs pt-2 border-t border-[#F5C400]/20">
                    Special: {holobot.specialMove}
                  </p>
                </div>

                {/* Attribute Boosts */}
                <div className="bg-black/60 p-3 border-2 border-[#F5C400]/50" style={{
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                }}>
                  <h3 className="text-[#F5C400] font-black uppercase text-sm mb-2 flex items-center justify-between">
                    <span>Available Boosts</span>
                    <Badge variant="outline" className="bg-blue-800/30 border-blue-500 text-blue-300 text-xs">
                      <Zap className="h-3 w-3 mr-1" /> {attributePoints}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`px-2 py-1.5 text-xs font-bold uppercase ${attributePoints > 0 ? 'bg-[#1A1F2C] border-2 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black' : 'bg-gray-800/50 border-2 border-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}
                      onClick={() => handleBoostAttribute('attack')}
                      disabled={attributePoints === 0}
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                      }}
                    >
                      +1 ATK
                    </button>
                    <button 
                      className={`px-2 py-1.5 text-xs font-bold uppercase ${attributePoints > 0 ? 'bg-[#1A1F2C] border-2 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black' : 'bg-gray-800/50 border-2 border-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}
                      onClick={() => handleBoostAttribute('defense')}
                      disabled={attributePoints === 0}
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                      }}
                    >
                      +1 DEF
                    </button>
                    <button 
                      className={`px-2 py-1.5 text-xs font-bold uppercase ${attributePoints > 0 ? 'bg-[#1A1F2C] border-2 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black' : 'bg-gray-800/50 border-2 border-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}
                      onClick={() => handleBoostAttribute('speed')}
                      disabled={attributePoints === 0}
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                      }}
                    >
                      +1 SPD
                    </button>
                    <button 
                      className={`px-2 py-1.5 text-xs font-bold uppercase ${attributePoints > 0 ? 'bg-[#1A1F2C] border-2 border-[#F5C400] text-[#F5C400] hover:bg-[#F5C400] hover:text-black' : 'bg-gray-800/50 border-2 border-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}
                      onClick={() => handleBoostAttribute('health')}
                      disabled={attributePoints === 0}
                      style={{
                        clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                      }}
                    >
                      +10 HP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isOwned && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">Mint this Holobot to view stats</p>
              </div>
            )}

            <p className="text-center text-[#F5C400] text-xs uppercase tracking-wider mt-4">
              Tap to flip back
            </p>
          </div>
        </div>
      </div>

      {/* Parts Equipment Dialog */}
      <Dialog open={isEquipDialogOpen} onOpenChange={setIsEquipDialogOpen}>
        <DialogContent 
          className="bg-black border-4 border-[#F5C400] text-white max-w-md shadow-[0_0_30px_rgba(245,196,0,0.5)]"
          style={{
            clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="text-[#F5C400] font-black uppercase tracking-widest text-center">
              Equip {selectedSlot ? slotNames[selectedSlot] : ''} Part
            </DialogTitle>
          </DialogHeader>
          
          {/* Current equipped part */}
          {selectedSlot && equippedParts[selectedSlot] && (
            <div className="mb-4 bg-gradient-to-br from-gray-900 to-black border-2 border-[#F5C400]/50 p-3" style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
            }}>
              <div className="flex items-start gap-3">
                {/* Part Image */}
                {getPartImage(equippedParts[selectedSlot].name) && (
                  <div className="flex-shrink-0 w-16 h-16 bg-black/50 border border-[#F5C400]/30 p-1 flex items-center justify-center">
                    <img 
                      src={getPartImage(equippedParts[selectedSlot].name)!}
                      alt={equippedParts[selectedSlot].name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-[#F5C400] uppercase">Currently Equipped</h4>
                    <button
                      onClick={(e) => selectedSlot && handleUnequipPart(selectedSlot, e)}
                      className="text-xs bg-red-600/80 hover:bg-red-700 text-white px-2 py-1 font-bold uppercase tracking-wide transition-colors border border-red-800"
                      style={{
                        clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
                      }}
                    >
                      <X className="h-3 w-3 inline mr-1" />
                      Unequip
                    </button>
                  </div>
                  <p className="text-white font-semibold">{equippedParts[selectedSlot].name}</p>
                  <p className="text-xs text-gray-400 mb-2">{equippedParts[selectedSlot].description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-red-400">ATK: +{equippedParts[selectedSlot].baseStats.attack}</span>
                    <span className="text-blue-400">DEF: +{equippedParts[selectedSlot].baseStats.defense}</span>
                    <span className="text-yellow-400">SPD: +{equippedParts[selectedSlot].baseStats.speed}</span>
                    <span className="text-purple-400">INT: +{equippedParts[selectedSlot].baseStats.intelligence}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Available parts list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {availablePartsForSlot.length > 0 ? (
              availablePartsForSlot.map((part) => {
                const partImageUrl = getPartImage(part.name);
                
                return (
                  <div 
                    key={part.id} 
                    className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 hover:border-[#F5C400]/70 p-3 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEquipPart(part);
                    }}
                    style={{
                      clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Part Image */}
                      {partImageUrl && (
                        <div className="flex-shrink-0 w-16 h-16 bg-black/50 border border-[#F5C400]/30 p-1 flex items-center justify-center">
                          <img 
                            src={partImageUrl}
                            alt={part.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-white uppercase">{part.name}</h4>
                          <Badge 
                            className={`text-xs uppercase font-bold ${
                              part.tier === 'legendary' ? 'bg-orange-600/30 border-orange-500 text-orange-400' :
                              part.tier === 'epic' ? 'bg-purple-600/30 border-purple-500 text-purple-400' :
                              part.tier === 'rare' ? 'bg-blue-600/30 border-blue-500 text-blue-400' :
                              'bg-gray-600/30 border-gray-500 text-gray-400'
                            }`}
                          >
                            {part.tier}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-300 mb-2">{part.description}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="text-red-400 font-semibold">ATK: +{part.baseStats.attack}</span>
                          <span className="text-blue-400 font-semibold">DEF: +{part.baseStats.defense}</span>
                          <span className="text-yellow-400 font-semibold">SPD: +{part.baseStats.speed}</span>
                          <span className="text-purple-400 font-semibold">INT: +{part.baseStats.intelligence}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm uppercase tracking-wide">
                  No parts available for this slot
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Purchase parts from the Marketplace
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
