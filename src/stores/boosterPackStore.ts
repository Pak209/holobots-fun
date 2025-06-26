import { create } from 'zustand';
import { BoosterPackItem, BoosterPackResult, BoosterPackType, BOOSTER_PACK_TYPES, MarketplaceBoosterTier, MARKETPLACE_BOOSTER_TIERS } from '../types/boosterPack';
import { Part, PartTier } from '../types/holobotParts';
import { MARKETPLACE_PARTS, createPartFromMarketplace } from '../data/marketplaceParts';
import { HOLOBOT_STATS } from '../types/holobot';

interface BoosterPackStore {
  // State
  openedPacks: BoosterPackResult[];
  isOpening: boolean;
  currentOpenResult: BoosterPackResult | null;
  
  // Actions
  openBoosterPack: (packType: BoosterPackType) => Promise<BoosterPackResult>;
  openMarketplaceBooster: (tier: MarketplaceBoosterTier) => Promise<BoosterPackResult>;
  generateRandomItem: (tier: 'common' | 'rare' | 'epic' | 'legendary') => BoosterPackItem;
  generateSpecificItem: (type: 'part' | 'blueprint' | 'item', tier: 'common' | 'rare' | 'epic' | 'legendary') => BoosterPackItem;
  clearOpenResult: () => void;
  addToHistory: (result: BoosterPackResult, updateUser?: (updates: any) => Promise<void>) => Promise<void>;
  loadHistoryFromUser: (packHistory: BoosterPackResult[]) => void;
}

// Helper function to get random tier based on rates
const getRandomTier = (rates: Record<string, number>): 'common' | 'rare' | 'epic' | 'legendary' => {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [tier, rate] of Object.entries(rates)) {
    cumulative += rate;
    if (random <= cumulative) {
      return tier as 'common' | 'rare' | 'epic' | 'legendary';
    }
  }
  
  return 'common';
};

// Helper function to get random part tier
const getRandomPartTier = (baseTier: 'common' | 'rare' | 'epic' | 'legendary'): PartTier => {
  const tierMap: Record<string, PartTier> = {
    common: 'common',
    rare: 'rare',
    epic: 'epic',
    legendary: 'legendary'
  };
  return tierMap[baseTier];
};

export const useBoosterPackStore = create<BoosterPackStore>((set, get) => ({
  openedPacks: [],
  isOpening: false,
  currentOpenResult: null,

  loadHistoryFromUser: (packHistory) => {
    set({ openedPacks: packHistory || [] });
  },

  generateRandomItem: (tier) => {
    const itemTypes = ['part', 'blueprint', 'currency', 'item'];
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    
    const baseId = `${randomType}_${tier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (randomType) {
      case 'part': {
        return get().generateSpecificItem('part', tier);
      }
      
      case 'blueprint': {
        return get().generateSpecificItem('blueprint', tier);
      }
      
      case 'currency': {
        // Only legendary tier can give HOLOS tokens, all others give gacha tickets
        const isHolos = tier === 'legendary' ? Math.random() > 0.3 : false; // 70% chance for HOLOS only on legendary, 0% for others
        
        if (isHolos) {
          const amount = tier === 'legendary' ? 500 : tier === 'epic' ? 250 : tier === 'rare' ? 100 : 50;
          return {
            id: baseId,
            type: 'currency' as const,
            tier,
            name: 'HOLOS Tokens',
            description: 'Premium in-game currency',
            quantity: amount,
            holosTokens: amount
          };
        } else {
          const amount = tier === 'legendary' ? 50 : tier === 'epic' ? 25 : tier === 'rare' ? 10 : 5;
          return {
            id: baseId,
            type: 'currency' as const,
            tier,
            name: 'Gacha Tickets',
            description: 'Use to open more booster packs',
            quantity: amount,
            gachaTickets: amount
          };
        }
      }
      
      case 'item': {
        return get().generateSpecificItem('item', tier);
      }
      
      default:
        throw new Error(`Unknown item type: ${randomType}`);
    }
  },

  generateSpecificItem: (type, tier) => {
    const baseId = `${type}_${tier}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (type) {
      case 'part': {
        // Get random part from marketplace
        const randomIndex = Math.floor(Math.random() * MARKETPLACE_PARTS.length);
        const marketplacePart = MARKETPLACE_PARTS[randomIndex];
        const partTier = getRandomPartTier(tier);
        
        const part = createPartFromMarketplace(marketplacePart, partTier);
        
        return {
          id: baseId,
          type: 'part' as const,
          tier,
          name: `${partTier} ${marketplacePart.name}`,
          description: marketplacePart.description,
          quantity: 1,
          part
        };
      }
      
      case 'blueprint': {
        // Use actual Holobots from HOLOBOT_STATS instead of mock types
        const holobotKeys = Object.keys(HOLOBOT_STATS);
        const randomHolobotKey = holobotKeys[Math.floor(Math.random() * holobotKeys.length)];
        const holobotName = HOLOBOT_STATS[randomHolobotKey].name;
        const pieces = tier === 'legendary' ? 10 : tier === 'epic' ? 7 : tier === 'rare' ? 5 : 3;
        
        return {
          id: baseId,
          type: 'blueprint' as const,
          tier,
          name: `${holobotName} Blueprint Fragment`,
          description: `Blueprint pieces for crafting ${holobotName} parts`,
          quantity: pieces,
          holobotKey: randomHolobotKey,
          blueprintPieces: pieces
        };
      }
      
      case 'item': {
        const items = [
          { type: 'arena_pass', name: 'Arena Pass', desc: 'Free entry to premium arena battles' },
          { type: 'energy_refill', name: 'Energy Refill', desc: 'Instantly restore all energy' },
          { type: 'exp_booster', name: 'EXP Booster', desc: 'Double experience for next battle' },
          { type: 'rank_skip', name: 'Rank Skip Token', desc: 'Skip to next rank tier' }
        ];
        
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const quantity = tier === 'legendary' ? 5 : tier === 'epic' ? 3 : tier === 'rare' ? 2 : 1;
        
        return {
          id: baseId,
          type: 'item' as const,
          tier,
          name: randomItem.name,
          description: randomItem.desc,
          quantity,
          itemType: randomItem.type as any
        };
      }
      
      default:
        throw new Error(`Unknown item type: ${type}`);
    }
  },

  openBoosterPack: async (packType) => {
    set({ isOpening: true });
    
    const packConfig = BOOSTER_PACK_TYPES[packType];
    const items: BoosterPackItem[] = [];
    
    // GUARANTEED DISTRIBUTION: 1 Blueprint + 1 Part + 1 Item
    const guaranteedTypes = ['blueprint', 'part', 'item'] as const;
    
    // Generate one of each guaranteed type
    for (const itemType of guaranteedTypes) {
      const tier = getRandomTier(packConfig.rarity);
      const item = get().generateSpecificItem(itemType, tier);
      items.push(item);
    }
    
    const result: BoosterPackResult = {
      packId: `${packType}_${Date.now()}`,
      items,
      openedAt: new Date()
    };
    
    // Simulate opening animation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    set({ 
      isOpening: false, 
      currentOpenResult: result 
    });
    
    return result;
  },

  clearOpenResult: () => {
    set({ currentOpenResult: null });
  },

  openMarketplaceBooster: async (tier) => {
    set({ isOpening: true });
    
    const boosterConfig = MARKETPLACE_BOOSTER_TIERS[tier];
    const items: BoosterPackItem[] = [];
    
    // GUARANTEED DISTRIBUTION: 1 Blueprint + 1 Part + 1 Item
    const guaranteedTypes = ['blueprint', 'part', 'item'] as const;
    
    // Generate one of each guaranteed type
    for (const itemType of guaranteedTypes) {
      const itemTier = getRandomTier(boosterConfig.rarity);
      const item = get().generateSpecificItem(itemType, itemTier);
      items.push(item);
    }
    
    const result: BoosterPackResult = {
      packId: `marketplace_${tier}_${Date.now()}`,
      items,
      openedAt: new Date()
    };
    
    // Simulate opening animation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    set({ 
      isOpening: false, 
      currentOpenResult: result 
    });
    
    return result;
  },

  addToHistory: async (result, updateUser) => {
    // Add to local state immediately
    set(state => ({
      openedPacks: [result, ...state.openedPacks].slice(0, 50) // Keep last 50 packs
    }));

    // Save to user profile if updateUser function is provided
    if (updateUser) {
      try {
        const currentPacks = get().openedPacks;
        await updateUser({
          pack_history: currentPacks
        });
      } catch (error) {
        console.error('Failed to save pack history to user profile:', error);
      }
    }
  }
})); 