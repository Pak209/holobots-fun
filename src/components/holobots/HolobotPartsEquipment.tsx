import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { Part, PartSlot, TIER_COLORS } from "@/types/holobotParts";
import { Settings, Zap, Shield, Brain, Gauge, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface HolobotPartsEquipmentProps {
  holobotName: string;
}

const slotIcons = {
  head: Brain,
  torso: Shield,
  arms: Zap,
  legs: Gauge,
  core: Zap,
};

const slotNames = {
  head: "Head",
  torso: "Torso", 
  arms: "Arms",
  legs: "Legs",
  core: "Core",
};

export function HolobotPartsEquipment({ holobotName }: HolobotPartsEquipmentProps) {
  const { 
    inventory, 
    getEquippedParts, 
    getInventoryBySlot, 
    equipPart, 
    unequipPart 
  } = useHolobotPartsStore();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<PartSlot | null>(null);
  const [isEquipDialogOpen, setIsEquipDialogOpen] = useState(false);

  const equippedParts = getEquippedParts(holobotName);
  const slots: PartSlot[] = ['head', 'torso', 'arms', 'legs', 'core'];

  const handleEquipPart = async (part: Part) => {
    try {
      equipPart(holobotName, part);
      
      // Save equipped parts to database
      if (user) {
        const updatedEquippedParts = {
          ...user.equippedParts,
          [holobotName]: {
            ...getEquippedParts(holobotName),
            [part.slot]: part,
          }
        };
        
        await updateUser({
          equippedParts: updatedEquippedParts
        });
      }
      
      setIsEquipDialogOpen(false);
      setSelectedSlot(null);
      toast({
        title: "Part Equipped!",
        description: `${part.name} has been equipped to ${holobotName}'s ${part.slot}.`,
      });
    } catch (error) {
      toast({
        title: "Equipment Failed",
        description: "Failed to equip the part. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnequipPart = async (slot: PartSlot) => {
    try {
      unequipPart(holobotName, slot);
      
      // Save equipped parts to database
      if (user) {
        const currentEquipment = getEquippedParts(holobotName);
        const updatedEquipment = { ...currentEquipment };
        delete updatedEquipment[slot];
        
        const updatedEquippedParts = {
          ...user.equippedParts,
          [holobotName]: updatedEquipment
        };
        
        await updateUser({
          equippedParts: updatedEquippedParts
        });
      }
      
      toast({
        title: "Part Unequipped",
        description: `Part removed from ${slotNames[slot]} slot.`,
      });
    } catch (error) {
      toast({
        title: "Unequip Failed",
        description: "Failed to unequip the part. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEquipDialog = (slot: PartSlot) => {
    setSelectedSlot(slot);
    setIsEquipDialogOpen(true);
  };

  const availablePartsForSlot = selectedSlot ? getInventoryBySlot(selectedSlot) : [];

  const getTotalStatBonus = () => {
    const totals = { attack: 0, defense: 0, speed: 0, intelligence: 0 };
    
    Object.values(equippedParts).forEach(part => {
      if (part) {
        totals.attack += part.baseStats.attack;
        totals.defense += part.baseStats.defense;
        totals.speed += part.baseStats.speed;
        totals.intelligence += part.baseStats.intelligence;
      }
    });
    
    return totals;
  };

  const statBonuses = getTotalStatBonus();

  return (
    <div className="mt-2">
      <h3 className="text-[9px] font-bold mb-1 text-holobots-accent dark:text-holobots-dark-accent flex items-center justify-between">
        <span className="flex items-center">
          <Settings className="h-2 w-2 mr-1" />
          Parts Equipment
        </span>
        {(statBonuses.attack > 0 || statBonuses.defense > 0 || statBonuses.speed > 0 || statBonuses.intelligence > 0) && (
          <Badge variant="outline" className="bg-purple-500/20 border-purple-500 text-purple-400 text-[7px] py-0 px-1 h-3">
            +{statBonuses.attack + statBonuses.defense + statBonuses.speed + statBonuses.intelligence}
          </Badge>
        )}
      </h3>

      {/* Equipment Slots */}
      <div className="space-y-1">
        {slots.map(slot => {
          const equippedPart = equippedParts[slot];
          const SlotIcon = slotIcons[slot];
          
          return (
            <div key={slot} className="flex items-center justify-between bg-black/20 rounded p-1">
              <div className="flex items-center flex-1 min-w-0">
                <SlotIcon className="h-3 w-3 text-gray-400 mr-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {equippedPart ? (
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="text-[8px] text-white truncate" title={equippedPart.name}>
                          {equippedPart.name}
                        </div>
                        <div className={`text-[7px] capitalize ${TIER_COLORS[equippedPart.tier]}`}>
                          {equippedPart.tier}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-red-500/20"
                        onClick={() => handleUnequipPart(slot)}
                      >
                        <X className="h-2 w-2 text-red-400" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[8px] text-gray-500">
                      No {slotNames[slot].toLowerCase()} equipped
                    </div>
                  )}
                </div>
              </div>
              
              {!equippedPart && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-cyan-500/20"
                  onClick={() => openEquipDialog(slot)}
                  disabled={getInventoryBySlot(slot).length === 0}
                >
                  <Plus className="h-2 w-2 text-cyan-400" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      {(statBonuses.attack > 0 || statBonuses.defense > 0 || statBonuses.speed > 0 || statBonuses.intelligence > 0) && (
        <div className="mt-1 p-1.5 bg-purple-500/20 rounded border-2 border-purple-400/60 shadow-lg">
          <div className="text-[8px] text-purple-300 font-bold mb-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Parts Bonus:</div>
          <div className="grid grid-cols-2 gap-0.5 text-[8px] font-semibold">
            {statBonuses.attack > 0 && (
              <div className="text-red-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">ATK: +{statBonuses.attack}</div>
            )}
            {statBonuses.defense > 0 && (
              <div className="text-blue-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">DEF: +{statBonuses.defense}</div>
            )}
            {statBonuses.speed > 0 && (
              <div className="text-green-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">SPD: +{statBonuses.speed}</div>
            )}
            {statBonuses.intelligence > 0 && (
              <div className="text-purple-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">INT: +{statBonuses.intelligence}</div>
            )}
          </div>
        </div>
      )}

      {/* Equipment Dialog */}
      <Dialog open={isEquipDialogOpen} onOpenChange={setIsEquipDialogOpen}>
        <DialogContent className="bg-[#1A1F2C] border-cyan-900/30 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">
              Equip {selectedSlot ? slotNames[selectedSlot] : ''} Part
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {availablePartsForSlot.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availablePartsForSlot.map(part => (
                  <div 
                    key={part.id} 
                    className="bg-black/40 rounded p-3 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{part.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs capitalize ${TIER_COLORS[part.tier]}`}
                        >
                          {part.tier}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-300 mb-2">{part.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {Object.entries(part.baseStats).map(([stat, value]) => (
                        <div key={stat} className="text-xs">
                          <span className="text-gray-400 capitalize">{stat}:</span>
                          <span className={`ml-1 ${value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {value > 0 ? '+' : ''}{value}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => handleEquipPart(part)}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs"
                    >
                      Equip Part
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No {selectedSlot} parts available</p>
                <p className="text-xs mt-1">
                  Purchase parts from the marketplace to equip them!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 