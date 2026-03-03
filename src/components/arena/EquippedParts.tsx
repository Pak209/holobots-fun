// ============================================================================
// Equipped Parts Display
// Shows the Holobot's currently equipped parts/gear
// ============================================================================

import type { ArenaFighter } from '@/types/arena';

interface EquippedPartsProps {
  fighter: ArenaFighter;
}

// Mapping of part names to their PNG/JPEG images (same as inventory)
const PART_IMAGES: Record<string, string> = {
  // Arms parts
  'Plasma Cannon': '/icons/ArmPartPlasmaCannon.png',
  'Plasma Cannons': '/icons/ArmPartPlasmaCannon.png',
  'Boxer Gloves': '/icons/ArmsPartBoxer.png',
  'Inferno Claws': '/icons/ArmsPartInfernoClaws.png',
  // Head parts
  'Combat Mask': '/icons/HeadPartCombatMask.png',
  'Void Mask': '/icons/HeadPartVoidMask.png',
  'Advanced Scanner': '/icons/HeadPartCombatMask.png',
  'Combat Visor': '/icons/HeadPartCombatMask.png',
  // Torso parts
  'Titanium Torso': '/icons/TorsoPart.png',
  'Steel Torso': '/icons/TorsoPart.png',
  'Reinforced Chassis': '/icons/TorsoPart.png',
  'Alloy Chassis': '/icons/TorsoPart.png',
  // Legs parts
  'Power Legs': '/icons/LegPart.png',
  'Speed Legs': '/icons/LegPart.png',
  'Turbo Boosters': '/icons/LegPart.png',
  'Boost Legs': '/icons/LegPart.png',
  // Core parts
  'Energy Core': '/icons/CorePart.png',
  'Power Core': '/icons/CorePart.png',
  'Quantum Core': '/icons/CorePart.png',
};

// Default images for each slot if no specific part image is found
const DEFAULT_SLOT_IMAGES: Record<string, string> = {
  head: '/icons/HeadPartCombatMask.png',
  torso: '/icons/TorsoPart.png',
  arms: '/icons/ArmPartPlasmaCannon.png',
  legs: '/icons/LegPart.png',
  core: '/icons/CorePart.png',
};

interface HolobotPart {
  id: string;
  name: string;
  type: 'head' | 'torso' | 'arms' | 'legs' | 'core';
  level: number;
  bonus: string;
  imageUrl: string;
}

export function EquippedParts({ fighter }: EquippedPartsProps) {
  // Helper function to get part image
  const getPartImage = (partName: string, slot: string): string => {
    const basePartName = partName.replace(/\s*\([^)]*\)\s*$/i, '').trim();
    return PART_IMAGES[basePartName] || DEFAULT_SLOT_IMAGES[slot] || '/icons/PartsBackground1.svg';
  };

  // Mock parts data - replace with actual data from fighter when available
  const mockParts: HolobotPart[] = [
    { 
      id: '1', 
      name: 'Combat Visor', 
      type: 'head', 
      level: fighter.level, 
      bonus: '+5 INT',
      imageUrl: getPartImage('Combat Visor', 'head')
    },
    { 
      id: '2', 
      name: 'Alloy Chassis', 
      type: 'torso', 
      level: fighter.level, 
      bonus: '+10 DEF',
      imageUrl: getPartImage('Alloy Chassis', 'torso')
    },
    { 
      id: '3', 
      name: 'Plasma Cannon', 
      type: 'arms', 
      level: fighter.level, 
      bonus: '+8 ATK',
      imageUrl: getPartImage('Plasma Cannon', 'arms')
    },
    { 
      id: '4', 
      name: 'Boost Legs', 
      type: 'legs', 
      level: fighter.level, 
      bonus: '+5 SPD',
      imageUrl: getPartImage('Boost Legs', 'legs')
    },
    { 
      id: '5', 
      name: 'Energy Core', 
      type: 'core', 
      level: fighter.level, 
      bonus: '+10 HP',
      imageUrl: getPartImage('Energy Core', 'core')
    },
  ];

  return (
    <div className="w-full bg-black border-3 border-gray-700 p-2.5 sm:p-3" style={{
      clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
    }}>
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-700">
        <h3 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
          <span>🔧</span>
          Equipped Parts
        </h3>
        <span className="text-[9px] text-gray-500 uppercase">{fighter.name}</span>
      </div>

      <div className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1">
        {mockParts.map((part) => (
          <div 
            key={part.id}
            className="flex-shrink-0 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-gray-600 hover:border-[#F5C400]/50 p-1 sm:p-1.5 min-w-[48px] sm:min-w-[56px] transition-all"
            style={{
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
            }}
          >
            <div className="text-center">
              {/* Part Image - Smaller size */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 mb-1 flex items-center justify-center bg-black/50 border border-gray-700 p-0.5">
                <img 
                  src={part.imageUrl}
                  alt={part.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to default image if load fails
                    e.currentTarget.src = DEFAULT_SLOT_IMAGES[part.type] || '/icons/PartsBackground1.svg';
                  }}
                />
              </div>
              
              {/* Part Name - Smaller text */}
              <p className="text-[7px] sm:text-[8px] text-gray-300 font-bold truncate mb-0.5" title={part.name}>
                {part.name}
              </p>
              
              {/* Level - Smaller */}
              <div className="flex items-center justify-center gap-0.5 mb-0.5">
                <span className="text-[7px] text-gray-500">LV</span>
                <span className="text-[8px] sm:text-[9px] font-black text-[#F5C400]">{part.level}</span>
              </div>
              
              {/* Bonus - Smaller */}
              <p className="text-[7px] sm:text-[8px] text-green-400 font-bold">{part.bonus}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="mt-2 pt-1.5 border-t border-gray-800">
        <p className="text-[8px] sm:text-[9px] text-gray-500 text-center">
          Parts contribute to your Holobot's combat stats
        </p>
      </div>
    </div>
  );
}
