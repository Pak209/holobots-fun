import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MarketplaceHolobotCard } from "@/components/marketplace/MarketplaceHolobotCard";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { MarketplacePartCard } from "@/components/marketplace/MarketplacePartCard";
import { BlueprintCard } from "@/components/marketplace/BlueprintCard";
import { HOLOBOT_STATS } from "@/types/holobot";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Plus,
  Search,
  SlidersHorizontal,
  Package,
  Zap
} from "lucide-react";
import { HOLOBOT_IMAGE_MAPPING } from "@/utils/holobotImageUtils";
import { UserHolobot } from "@/types/user";
import { MARKETPLACE_PARTS, MarketplacePart, createPartFromMarketplace } from "@/data/marketplaceParts";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { Part } from "@/types/holobotParts";
import { cn } from "@/lib/utils";

const MARKETPLACE_ITEMS = [
  // Holobots
  {
    id: "h1",
    type: "holobot",
    name: "ACE",
    level: 15,
    price: 5000,
    seller: "HoloTrader",
    createdAt: new Date('2023-07-15')
  },
  {
    id: "h2",
    type: "holobot",
    name: "KUMA",
    level: 22,
    price: 7500,
    seller: "RareBotSeller",
    createdAt: new Date('2023-07-10')
  },
  {
    id: "h3",
    type: "holobot",
    name: "HARE",
    level: 8,
    price: 3000,
    seller: "NewbTrader",
    createdAt: new Date('2023-07-18')
  },
  
  // Blueprints
  {
    id: "b1",
    type: "blueprint",
    holobotName: "ACE",
    tier: 1,
    price: 500,
    seller: "BlueprintMaster",
    createdAt: new Date('2023-07-16')
  },
  {
    id: "b2",
    type: "blueprint",
    holobotName: "KUMA",
    tier: 2,
    price: 1200,
    seller: "BlueprintMaster",
    createdAt: new Date('2023-07-17')
  },
  {
    id: "b3",
    type: "blueprint",
    holobotName: "WOLF",
    tier: 3,
    price: 2500,
    seller: "LegendaryTrader",
    createdAt: new Date('2023-07-12')
  },
  {
    id: "b4",
    type: "blueprint",
    holobotName: "TORA",
    tier: 2,
    price: 1000,
    seller: "RareBotSeller",
    createdAt: new Date('2023-07-15')
  },
  
  // Items
  {
    id: "i1",
    type: "item",
    itemType: "energy-refill" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Daily Energy Refill",
    description: "Restores your daily energy to full",
    rarity: "common" as "common" | "rare" | "extremely-rare",
    price: 200,
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-19')
  },
  {
    id: "i2",
    type: "item",
    itemType: "exp-booster" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Exp Battle Booster",
    description: "Doubles experience gained from battles for 24 hours",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 750,
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-14')
  },
  {
    id: "i3",
    type: "item",
    itemType: "rank-skip" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Rank Skip",
    description: "Skip to the next rank instantly",
    rarity: "extremely-rare" as "common" | "rare" | "extremely-rare",
    price: 5000,
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-05')
  },
  {
    id: "i4",
    type: "item",
    itemType: "arena-pass" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Arena Pass",
    description: "Grants entry to one arena battle without costing HOLOS tokens",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,  
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-12')
  },
  {
    id: "i5",
    type: "item",
    itemType: "gacha-ticket" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip",
    name: "Gacha Ticket",
    description: "Can be used for one pull in the Gacha system",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,  
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-16')
  }
];

// Define types for marketplace items for clarity (optional but good practice)
interface MarketplaceItemBase {
  id: string;
  price: number;
  seller: string;
  createdAt: Date;
  name: string; // Add name here as it's common for display in handleBuy
}

interface MarketplaceHolobotItem extends MarketplaceItemBase {
  type: "holobot";
  name: string;
  level: number;
}

interface MarketplaceBlueprintItem extends MarketplaceItemBase {
  type: "blueprint";
  holobotName: string;
  tier: number;
}

export type ItemTypeKey = "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip";

interface MarketplaceConsumableItem extends MarketplaceItemBase {
  type: "item";
  itemType: ItemTypeKey;
  description: string;
  rarity: "common" | "rare" | "extremely-rare";
  quantity: number;
}

export type AnyMarketplaceItem = MarketplaceHolobotItem | MarketplaceBlueprintItem | MarketplaceConsumableItem;

interface MarketplaceProps {
  hideHeader?: boolean;
}

const Marketplace = ({ hideHeader = false }: MarketplaceProps = {}) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [filteredItems, setFilteredItems] = useState(MARKETPLACE_ITEMS as AnyMarketplaceItem[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [activeShopTab, setActiveShopTab] = useState<'items' | 'parts'>('items');
  const { addPart, inventory, loadPartsFromUser, loadEquippedPartsFromUser } = useHolobotPartsStore();

  // Clean up invalid blueprint entries
  const cleanupInvalidBlueprints = async () => {
    if (!user || !user.blueprints) return;
    
    const validHolobotKeys = Object.keys(HOLOBOT_STATS);
    const invalidTypes = ['common', 'owned_parts', 'inventory'];
    
    // Find invalid blueprint entries
    const invalidEntries = Object.keys(user.blueprints).filter(key => {
      // Check if it's an invalid type
      if (invalidTypes.some(invalid => key.toLowerCase().includes(invalid))) {
        return true;
      }
      
      // Check if it's not a valid holobot key
      return !validHolobotKeys.some(validKey => 
        validKey.toLowerCase() === key.toLowerCase()
      );
    });
    
    if (invalidEntries.length > 0) {
      console.log('Cleaning up invalid blueprint entries:', invalidEntries);
      
      // Create a new blueprints object without invalid entries
      const cleanedBlueprints = { ...user.blueprints };
      invalidEntries.forEach(invalidKey => {
        delete cleanedBlueprints[invalidKey];
      });
      
      // Update the user's blueprints in the database
      try {
        await updateUser({ blueprints: cleanedBlueprints });
        toast({
          title: "Blueprints Cleaned",
          description: "Removed invalid blueprint entries from your inventory.",
        });
      } catch (error) {
        console.error('Error updating blueprints:', error);
      }
    }
  };

  // Load user parts when user data is available
  useEffect(() => {
    if (user?.parts) {
      loadPartsFromUser(user.parts);
    }
    if (user?.equippedParts) {
      loadEquippedPartsFromUser(user.equippedParts);
    }
    
    // Clean up invalid blueprints when inventory is viewed
    cleanupInvalidBlueprints();
  }, [user?.parts, user?.equippedParts, user?.blueprints, loadPartsFromUser, loadEquippedPartsFromUser]);
  
  // Filter items by type
  const holobotItems = MARKETPLACE_ITEMS.filter(item => item.type === "holobot") as MarketplaceHolobotItem[];
  const blueprintItems = MARKETPLACE_ITEMS.filter(item => item.type === "blueprint") as MarketplaceBlueprintItem[];
  const itemItems = MARKETPLACE_ITEMS.filter(item => item.type === "item") as MarketplaceConsumableItem[];
  
  const handleBuy = async (itemId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make a purchase.",
        variant: "destructive",
      });
      return;
    }
    
    setIsBuying(true);

    const itemToBuy = MARKETPLACE_ITEMS.find(item => item.id === itemId) as AnyMarketplaceItem | undefined;

    if (!itemToBuy) {
      toast({ title: "Error", description: "Item not found.", variant: "destructive" });
      setIsBuying(false);
      return;
    }

    // Prevent buying Holobots
    if (itemToBuy.type === "holobot") {
      toast({
        title: "Buying Disabled",
        description: "Holobot purchasing from the marketplace is temporarily disabled.",
        variant: "destructive",
      });
      setIsBuying(false);
      return;
    }

    if (user.holosTokens < itemToBuy.price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${itemToBuy.price - user.holosTokens} more HOLOS tokens to purchase this item.`,
        variant: "destructive",
      });
      setIsBuying(false);
      return;
    }
    
    try {
      const newHolosTokens = user.holosTokens - itemToBuy.price;
      let updatedUserProfileFields: Partial<typeof user> = { holosTokens: newHolosTokens };

      if (itemToBuy.type === "blueprint") {
        const currentBlueprints = user.blueprints || {};
        const updatedBlueprints = {
          ...currentBlueprints,
          [itemToBuy.holobotName]: (currentBlueprints[itemToBuy.holobotName] || 0) + 1,
        };
        updatedUserProfileFields.blueprints = updatedBlueprints;
      } else if (itemToBuy.type === "item") {
        switch (itemToBuy.itemType) {
          case "gacha-ticket":
            updatedUserProfileFields.gachaTickets = (user.gachaTickets || 0) + 1;
            break;
          case "arena-pass":
            updatedUserProfileFields.arena_passes = (user.arena_passes || 0) + 1;
            break;
          case "exp-booster":
            updatedUserProfileFields.exp_boosters = (user.exp_boosters || 0) + 1;
            break;
          case "energy-refill":
            updatedUserProfileFields.energy_refills = (user.energy_refills || 0) + 1;
            break;
          case "rank-skip":
            updatedUserProfileFields.rank_skips = (user.rank_skips || 0) + 1;
            break;
          default:
            throw new Error(`Unknown item type: ${itemToBuy.itemType}`);
        }
      }

      await updateUser(updatedUserProfileFields); 

      toast({
        title: "Purchase Successful",
        description: `You've purchased ${itemToBuy.name} for ${itemToBuy.price} HOLOS tokens.`,
      });

    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  // Add new function for handling part purchases
  const handleBuyPart = async (partId: string, tier: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make a purchase.",
        variant: "destructive",
      });
      return;
    }
    
    setIsBuying(true);

    const marketplacePart = MARKETPLACE_PARTS.find(item => item.id === partId);
    if (!marketplacePart) {
      toast({ title: "Error", description: "Part not found.", variant: "destructive" });
      setIsBuying(false);
      return;
    }

    const tierData = marketplacePart.tiers.find(t => t.tier === tier);
    if (!tierData) {
      toast({ title: "Error", description: "Tier not found.", variant: "destructive" });
      setIsBuying(false);
      return;
    }

    if (user.holosTokens < tierData.price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${tierData.price - user.holosTokens} more HOLOS tokens to purchase this part.`,
        variant: "destructive",
      });
      setIsBuying(false);
      return;
    }

    try {
      // Create the part with the selected tier
      const newPart = createPartFromMarketplace(marketplacePart, tier as Part['tier']);
      
      // Add part to local inventory first
      addPart(newPart);
      
      // Update user's parts in the database and deduct HOLOS tokens
      const updatedParts = [...(user.parts || []), newPart];
      
      try {
        await updateUser({
          holosTokens: user.holosTokens - tierData.price,
          parts: updatedParts,
        });
      } catch (dbError) {
        console.warn("Database update failed, but part added to local inventory:", dbError);
        // Still show success since the part is in local inventory
        // The user will need to apply the database migration for persistence
      }

      toast({
        title: "Purchase Successful!",
        description: `You bought ${newPart.name} for ${tierData.price} HOLOS tokens.`,
      });
    } catch (error) {
      console.error("Error purchasing part:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className={hideHeader ? "" : "text-gray-900"}>
      <div className={hideHeader ? "" : "container mx-auto px-4 pb-16"}>
        {!hideHeader && (
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-black font-orbitron italic">
              HOLOBOT MARKETPLACE
            </h1>
            <p className="text-gray-800 text-sm max-w-md mx-auto">
              Buy and sell Holobots, Blueprints, and Items
            </p>
          </div>
        )}

        {/* Shop Tab Selector */}
        <div className="px-4 py-4 relative z-10 mb-6">
          <div className="flex items-center justify-center">
            <div className="relative bg-black/60 rounded-lg p-1 border border-cyan-500/30">
              <div
                className={cn(
                  "absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out",
                  "bg-gradient-to-r shadow-lg",
                  activeShopTab === 'items'
                    ? "left-1 w-1/2 from-yellow-500/40 to-orange-600/40 border border-yellow-400/50"
                    : "left-1/2 right-1 from-cyan-500/40 to-cyan-600/40 border border-cyan-400/50"
                )}
              />
              <div className="relative flex gap-3">
                <button
                  onClick={() => setActiveShopTab('items')}
                  className={cn(
                    "px-8 py-4 text-sm font-bold tracking-wider transition-all duration-200 relative z-10 uppercase",
                    "flex items-center justify-center gap-3",
                    "border-4 clip-path-diagonal",
                    activeShopTab === 'items'
                      ? "bg-[#F5C400] border-[#F5C400] text-black shadow-[0_0_20px_rgba(245,196,0,0.6)]"
                      : "bg-black/80 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  )}
                  style={{
                    clipPath: activeShopTab === 'items'
                      ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                      : 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                >
                  <Package className="h-5 w-5" />
                  SHOP ITEMS
                </button>
                <button
                  onClick={() => setActiveShopTab('parts')}
                  className={cn(
                    "px-8 py-4 text-sm font-bold tracking-wider transition-all duration-200 relative z-10 uppercase",
                    "flex items-center justify-center gap-3",
                    "border-4 clip-path-diagonal",
                    activeShopTab === 'parts'
                      ? "bg-[#F5C400] border-[#F5C400] text-black shadow-[0_0_20px_rgba(245,196,0,0.6)]"
                      : "bg-black/80 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  )}
                  style={{
                    clipPath: activeShopTab === 'parts'
                      ? 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                      : 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                >
                  <Zap className="h-5 w-5" />
                  SHOP PARTS
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-4">
          {/* Shop Items Tab */}
          {activeShopTab === 'items' && (
            <div>
              {/* SHOP ITEM Header */}
              <div className="relative mb-6 w-fit">
                <div className="bg-gradient-to-r from-[#F5C400] to-transparent p-3 pr-16 border-4 border-[#F5C400] shadow-[0_0_20px_rgba(245,196,0,0.4)]" style={{
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
                }}>
                  <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-widest">SHOP ITEM</h2>
                </div>
              </div>

              <div className="space-y-4">
                {itemItems.map(item => {
                // Get the appropriate icon path
                const getItemIcon = (itemType: string) => {
                  switch(itemType) {
                    case 'arena-pass':
                      return '/src/assets/icons/ArenaPass.jpeg';
                    case 'gacha-ticket':
                      return '/src/assets/icons/GachaTicket.jpeg';
                    case 'energy-refill':
                      return '/src/assets/icons/EnergyRefill.jpeg';
                    case 'exp-booster':
                      return '/src/assets/icons/EXPboost.jpeg';
                    case 'rank-skip':
                      return '/src/assets/icons/RankSkip.jpeg';
                    default:
                      return null;
                  }
                };

                const iconPath = getItemIcon(item.itemType);

                return (
                  <div 
                    key={item.id} 
                    className="relative bg-gradient-to-r from-gray-900 via-black to-transparent border-4 border-[#F5C400] shadow-[0_0_15px_rgba(245,196,0,0.3)] hover:shadow-[0_0_25px_rgba(245,196,0,0.5)] transition-all"
                    style={{
                      clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                    }}
                  >
                    <div className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      {iconPath && (
                        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-black/50 border-2 border-[#F5C400]/50 p-2" style={{
                          clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                        }}>
                          <img 
                            src={iconPath} 
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider mb-1">
                          {item.name}
                        </h3>
                        <div className="h-1 w-full bg-gray-700 mb-2" style={{
                          clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)'
                        }}></div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-black/70 border-2 border-cyan-400 px-4 py-2" style={{
                          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                        }}>
                          <span className="text-2xl sm:text-3xl font-black text-white">{item.price}</span>
                          <img 
                            src="/src/assets/icons/HOlos.svg" 
                            alt="HOLOS"
                            className="w-6 h-6 sm:w-8 sm:h-8"
                          />
                        </div>
                        <Button 
                          className="bg-[#F5C400] hover:bg-[#D4A400] text-black font-black uppercase tracking-widest text-sm px-6 py-2 border-2 border-black shadow-[0_0_10px_rgba(245,196,0,0.5)] transition-all"
                          style={{
                            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                          }}
                          onClick={() => handleBuy(item.id)}
                          disabled={isBuying}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Shop Parts Tab */}
          {activeShopTab === 'parts' && (
            <div>
              {/* HOLOBOT PARTS Header */}
              <div className="relative mb-6 w-fit">
                <div className="bg-gradient-to-r from-[#F5C400] to-transparent p-3 pr-16 border-4 border-[#F5C400] shadow-[0_0_20px_rgba(245,196,0,0.4)]" style={{
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)'
                }}>
                  <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-widest">HOLOBOT PARTS</h2>
                </div>
              </div>

              <div className="space-y-4">
                {MARKETPLACE_PARTS.map(part => {
                  // Get the appropriate icon path for parts
                  const getPartIcon = (partName: string, slot: string) => {
                    // Map by part name
                    const partNameMap: Record<string, string> = {
                      'Plasma Cannons': '/src/assets/icons/ArmPartPlasmaCannon.png',
                      'Advanced Scanner': '/src/assets/icons/HeadPartCombatMask.png',
                      'Reinforced Chassis': '/src/assets/icons/TorsoPart.png',
                      'Turbo Boosters': '/src/assets/icons/LegPart.png',
                      'Quantum Core': '/src/assets/icons/CorePart.png',
                    };
                    
                    // Try to get by name first
                    if (partNameMap[partName]) {
                      return partNameMap[partName];
                    }
                    
                    // Fallback to slot-based mapping
                    const slotMap: Record<string, string> = {
                      'arms': '/src/assets/icons/ArmPartPlasmaCannon.png',
                      'head': '/src/assets/icons/HeadPartCombatMask.png',
                      'torso': '/src/assets/icons/TorsoPart.png',
                      'legs': '/src/assets/icons/LegPart.png',
                      'core': '/src/assets/icons/CorePart.png',
                    };
                    
                    return slotMap[slot] || null;
                  };

                  const iconPath = getPartIcon(part.name, part.slot);

                  return (
                    <div 
                      key={part.id} 
                      className="relative bg-gradient-to-r from-gray-900 via-black to-transparent border-4 border-[#F5C400] shadow-[0_0_15px_rgba(245,196,0,0.3)] hover:shadow-[0_0_25px_rgba(245,196,0,0.5)] transition-all"
                      style={{
                        clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)'
                      }}
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Icon */}
                        {iconPath && (
                          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-black/50 border-2 border-[#F5C400]/50 p-2" style={{
                            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'
                          }}>
                            <img 
                              src={iconPath} 
                              alt={part.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                              {part.name}
                            </h3>
                            <span className="text-xs uppercase font-bold px-2 py-1 bg-cyan-500/30 text-cyan-400 border border-cyan-400/50 rounded">
                              {part.slot}
                            </span>
                          </div>
                          <div className="h-1 w-full bg-gray-700 mb-2" style={{
                            clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)'
                          }}></div>
                          <p className="text-gray-400 text-xs sm:text-sm mb-3">
                            {part.description}
                          </p>
                          
                          {/* Tier Selection */}
                          <div className="flex flex-wrap gap-2">
                            {part.tiers.map((tierData) => {
                              const getTierColor = (tier: string) => {
                                switch(tier) {
                                  case 'mythic': return 'border-pink-500 text-pink-400 hover:bg-pink-500/20';
                                  case 'legendary': return 'border-orange-500 text-orange-400 hover:bg-orange-500/20';
                                  case 'epic': return 'border-purple-500 text-purple-400 hover:bg-purple-500/20';
                                  case 'rare': return 'border-blue-500 text-blue-400 hover:bg-blue-500/20';
                                  default: return 'border-gray-500 text-gray-400 hover:bg-gray-500/20';
                                }
                              };

                              return (
                                <Button
                                  key={tierData.tier}
                                  className={cn(
                                    "text-xs font-bold uppercase px-3 py-1 bg-black/50 border-2 transition-all",
                                    getTierColor(tierData.tier)
                                  )}
                                  style={{
                                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)'
                                  }}
                                  onClick={() => handleBuyPart(part.id, tierData.tier)}
                                  disabled={isBuying}
                                >
                                  {tierData.tier}: {tierData.price}
                                  <img 
                                    src="/src/assets/icons/HOlos.svg" 
                                    alt="HOLOS"
                                    className="w-3 h-3 ml-1 inline"
                                  />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
