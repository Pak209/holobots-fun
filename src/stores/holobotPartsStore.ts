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
  getInventoryByTier: (tier: Part['tier']) => Part[];
}

export const useHolobotPartsStore = create<HolobotPartsState>((set, get) => ({
  inventory: [],
  equippedParts: {},
  
  addPart: (part) => set((state) => ({
    inventory: [...state.inventory, part],
  })),
  
  loadPartsFromUser: (parts) => set(() => ({
    inventory: parts,
  })),
  
  loadEquippedPartsFromUser: (equippedParts) => set(() => ({
    equippedParts: equippedParts,
  })),
  
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
  
  getInventoryByTier: (tier) => {
    return get().inventory.filter((part) => part.tier === tier);
  },
})); 