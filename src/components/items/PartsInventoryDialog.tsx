import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { Badge } from "@/components/ui/badge";
import { PartSlot } from "@/types/holobotParts";

interface PartsInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mapping of part slots to their PNG images
const PART_IMAGES: Record<string, string> = {
  // Arms parts
  'Plasma Cannon': '/src/assets/icons/ArmPartPlasmaCannon.png',
  'Plasma Cannons': '/src/assets/icons/ArmPartPlasmaCannon.png',
  'Boxer Gloves': '/src/assets/icons/ArmsPartBoxer.png',
  'Inferno Claws': '/src/assets/icons/ArmsPartInfernoClaws.png',
  // Head parts
  'Combat Mask': '/src/assets/icons/HeadPartCombatMask.png',
  'Void Mask': '/src/assets/icons/HeadPartVoidMask.png',
  'Advanced Scanner': '/src/assets/icons/HeadPartCombatMask.png',
  // Torso parts
  'Titanium Torso': '/src/assets/icons/TorsoPart.png',
  'Steel Torso': '/src/assets/icons/TorsoPart.png',
  'Reinforced Chassis': '/src/assets/icons/TorsoPart.png',
  // Legs parts
  'Power Legs': '/src/assets/icons/LegPart.png',
  'Speed Legs': '/src/assets/icons/LegPart.png',
  'Turbo Boosters': '/src/assets/icons/LegPart.png',
  // Core parts
  'Energy Core': '/src/assets/icons/CorePart.png',
  'Power Core': '/src/assets/icons/CorePart.png',
  'Quantum Core': '/src/assets/icons/CorePart.png',
};

const SLOT_NAMES: Record<PartSlot, string> = {
  head: "HEAD",
  torso: "TORSO",
  arms: "ARMS",
  legs: "LEGS",
  core: "CORE",
};

export function PartsInventoryDialog({ open, onOpenChange }: PartsInventoryDialogProps) {
  const { inventory, equippedParts, getInventoryBySlot } = useHolobotPartsStore();
  
  const slots: PartSlot[] = ['head', 'torso', 'arms', 'legs', 'core'];

  // Get all parts grouped by type with counts
  const getPartsCountBySlot = (slot: PartSlot) => {
    const partsInSlot = inventory.filter(p => p.slot === slot);
    const grouped: Record<string, number> = {};
    
    partsInSlot.forEach(part => {
      if (grouped[part.name]) {
        grouped[part.name]++;
      } else {
        grouped[part.name] = 1;
      }
    });
    
    return grouped;
  };

  const getPartImage = (partName: string): string => {
    // Remove tier suffix if present (e.g., "Quantum Core (Epic)" -> "Quantum Core")
    const basePartName = partName.replace(/\s*\([^)]*\)\s*$/i, '').trim();
    return PART_IMAGES[basePartName] || '/src/assets/icons/PartsBackground1.svg';
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'legendary':
        return 'bg-orange-600/30 border-orange-500 text-orange-400';
      case 'epic':
        return 'bg-purple-600/30 border-purple-500 text-purple-400';
      case 'rare':
        return 'bg-blue-600/30 border-blue-500 text-blue-400';
      default:
        return 'bg-gray-600/30 border-gray-500 text-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-black border-4 border-[#F5C400] text-white max-w-4xl max-h-[80vh] overflow-y-auto shadow-[0_0_30px_rgba(245,196,0,0.5)]"
        style={{
          clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#F5C400] font-black uppercase tracking-widest text-center text-2xl">
            Holobot Parts Inventory
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {slots.map(slot => {
            const partsCount = getPartsCountBySlot(slot);
            const parts = getInventoryBySlot(slot);
            const uniqueParts = Array.from(new Map(parts.map(p => [p.name, p])).values());
            
            return (
              <div key={slot} className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#F5C400]/50 p-4" style={{
                clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
              }}>
                <h3 className="text-lg font-black text-[#F5C400] uppercase tracking-widest mb-4 border-b-2 border-[#F5C400]/30 pb-2">
                  {SLOT_NAMES[slot]} PARTS
                </h3>
                
                {uniqueParts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {uniqueParts.map(part => {
                      const count = partsCount[part.name] || 0;
                      const imageUrl = getPartImage(part.name);
                      
                      return (
                        <div 
                          key={part.id}
                          className="bg-black/60 border-2 border-gray-700 hover:border-[#F5C400]/70 p-3 transition-all"
                          style={{
                            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                          }}
                        >
                          {/* Image */}
                          <div className="relative w-full aspect-square mb-2 flex items-center justify-center bg-black/50 border border-[#F5C400]/30 p-2">
                            <img 
                              src={imageUrl}
                              alt={part.name}
                              className="w-full h-full object-contain"
                            />
                            {count > 1 && (
                              <div className="absolute top-1 right-1 bg-[#F5C400] text-black text-xs font-black px-2 py-0.5 rounded-full">
                                x{count}
                              </div>
                            )}
                          </div>
                          
                          {/* Name */}
                          <h4 className="text-xs font-bold text-white uppercase mb-1 truncate" title={part.name}>
                            {part.name}
                          </h4>
                          
                          {/* Tier Badge */}
                          <Badge className={`text-[8px] uppercase font-bold ${getTierColor(part.tier)} mb-2`}>
                            {part.tier}
                          </Badge>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-1 text-[9px]">
                            <span className="text-red-400">ATK: +{part.baseStats.attack}</span>
                            <span className="text-blue-400">DEF: +{part.baseStats.defense}</span>
                            <span className="text-yellow-400">SPD: +{part.baseStats.speed}</span>
                            <span className="text-purple-400">INT: +{part.baseStats.intelligence}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm uppercase tracking-wide">No {SLOT_NAMES[slot]} parts in inventory</p>
                    <p className="text-xs mt-2">Purchase parts from the Marketplace</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total Count */}
        <div className="mt-6 bg-gradient-to-r from-[#F5C400] to-[#D4A400] p-3 border-2 border-black" style={{
          clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
        }}>
          <p className="text-black font-black uppercase tracking-widest text-center">
            Total Parts: {inventory.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
