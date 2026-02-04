import { create } from 'zustand';
import { Part, HolobotEquipment, PartSlot } from '../types/holobotParts';

interface HolobotPartsState {
  // Inventory
  inventory: Part[];
  equippedParts: Record<string, HolobotEquipment>; // holobotId -> equipment
  
  // Actions
  addPart: (part: Part) => void;
  removePart: (partId: string) => void;
  equipPart: (holobotId: string, part: Part) => void;
  unequipPart: (holobotId: string, slot: PartSlot) => void;
  loadPartsFromUser: (parts: Part[]) => void;
  loadEquippedPartsFromUser: (equippedParts: Record<string, HolobotEquipment>) => void;
  
  // Getters
  getEquippedParts: (holobotId: string) => HolobotEquipment;
  getInventoryBySlot: (slot: PartSlot) => Part[];
  getAvailableInventoryBySlot: (slot: PartSlot) => Part[]; // Only unequipped parts
  getInventoryByTier: (tier: Part['tier']) => Part[];
  isPartEquipped: (partId: string) => boolean;
  getPartEquippedTo: (partId: string) => string | null; // Returns holobotId or null
  getGroupedAvailableInventory: (slot: PartSlot) => Array<{ part: Part; quantity: number; partIds: string[] }>;
}

export const useHolobotPartsStore = create<HolobotPartsState>((set, get) => ({
  inventory: [],
  equippedParts: {},
  
  addPart: (part) => set((state) => ({
    inventory: [...state.inventory, part],
  })),
  
  loadPartsFromUser: (parts) => set((state) => {
    // Filter out parts that are already equipped
    const equippedPartIds = new Set<string>();
    for (const equipment of Object.values(state.equippedParts)) {
      for (const part of Object.values(equipment)) {
        if (part) {
          equippedPartIds.add(part.id);
        }
      }
    }
    
    const unequippedParts = parts.filter(part => !equippedPartIds.has(part.id));
    
    return {
      inventory: unequippedParts,
    };
  }),
  
  loadEquippedPartsFromUser: (equippedParts) => set((state) => {
    // When loading equipped parts, also filter the current inventory
    const equippedPartIds = new Set<string>();
    for (const equipment of Object.values(equippedParts)) {
      for (const part of Object.values(equipment)) {
        if (part) {
          equippedPartIds.add(part.id);
        }
      }
    }
    
    const unequippedInventory = state.inventory.filter(part => !equippedPartIds.has(part.id));
    
    return {
      equippedParts: equippedParts,
      inventory: unequippedInventory,
    };
  }),
  
  removePart: (partId) => set((state) => ({
    inventory: state.inventory.filter((p) => p.id !== partId),
  })),
  
  equipPart: (holobotId, part) => set((state) => {
    const currentEquipment = state.equippedParts[holobotId] || {};
    
    // Remove the part from inventory if it's there
    const newInventory = state.inventory.filter((p) => p.id !== part.id);
    
    // If there's already a part in that slot, add it back to inventory
    const oldPart = currentEquipment[part.slot];
    if (oldPart) {
      newInventory.push(oldPart);
    }
    
    return {
      inventory: newInventory,
      equippedParts: {
        ...state.equippedParts,
        [holobotId]: {
          ...currentEquipment,
          [part.slot]: part,
        },
      },
    };
  }),
  
  unequipPart: (holobotId, slot) => set((state) => {
    const currentEquipment = state.equippedParts[holobotId];
    if (!currentEquipment || !currentEquipment[slot]) return state;
    
    const part = currentEquipment[slot];
    const newEquipment = { ...currentEquipment };
    delete newEquipment[slot];
    
    return {
      inventory: [...state.inventory, part],
      equippedParts: {
        ...state.equippedParts,
        [holobotId]: newEquipment,
      },
    };
  }),
  
  getEquippedParts: (holobotId) => {
    return get().equippedParts[holobotId] || {};
  },
  
  getInventoryBySlot: (slot) => {
    return get().inventory.filter((part) => part.slot === slot);
  },
  
  getAvailableInventoryBySlot: (slot) => {
    const state = get();
    // Get all equipped part IDs
    const equippedPartIds = new Set<string>();
    for (const equipment of Object.values(state.equippedParts)) {
      for (const part of Object.values(equipment)) {
        if (part) {
          equippedPartIds.add(part.id);
        }
      }
    }
    // Return only unequipped parts for this slot
    return state.inventory.filter((part) => part.slot === slot && !equippedPartIds.has(part.id));
  },
  
  getGroupedAvailableInventory: (slot) => {
    const availableParts = get().getAvailableInventoryBySlot(slot);
    
    // Group parts by name and tier to identify duplicates
    const grouped = new Map<string, { part: Part; quantity: number; partIds: string[] }>();
    
    availableParts.forEach((part) => {
      const key = `${part.name}-${part.tier}`;
      const existing = grouped.get(key);
      
      if (existing) {
        existing.quantity += 1;
        existing.partIds.push(part.id);
      } else {
        grouped.set(key, {
          part: part,
          quantity: 1,
          partIds: [part.id],
        });
      }
    });
    
    return Array.from(grouped.values());
  },
  
  getInventoryByTier: (tier) => {
    return get().inventory.filter((part) => part.tier === tier);
  },
  
  isPartEquipped: (partId) => {
    const state = get();
    for (const equipment of Object.values(state.equippedParts)) {
      for (const part of Object.values(equipment)) {
        if (part && part.id === partId) {
          return true;
        }
      }
    }
    return false;
  },
  
  getPartEquippedTo: (partId) => {
    const state = get();
    for (const [holobotId, equipment] of Object.entries(state.equippedParts)) {
      for (const part of Object.values(equipment)) {
        if (part && part.id === partId) {
          return holobotId;
        }
      }
    }
    return null;
  },
})); 