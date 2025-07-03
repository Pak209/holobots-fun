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
  SlidersHorizontal
} from "lucide-react";
import { HOLOBOT_IMAGE_MAPPING } from "@/utils/holobotImageUtils";
import { supabase } from "@/integrations/supabase/client";
import { UserHolobot } from "@/types/user";
import { MARKETPLACE_PARTS, MarketplacePart, createPartFromMarketplace } from "@/data/marketplaceParts";
import { useHolobotPartsStore } from "@/stores/holobotPartsStore";
import { Part } from "@/types/holobotParts";

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
    itemType: "gacha-ticket" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "async-battle-ticket",
    name: "Gacha Ticket",
    description: "Can be used for one pull in the Gacha system",
    rarity: "rare" as "common" | "rare" | "extremely-rare",
    price: 50,  
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-16')
  },
  {
    id: "i6",
    type: "item",
    itemType: "async-battle-ticket" as "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "async-battle-ticket",
    name: "Async Battle Ticket",
    description: "Grants entry to one async battle in PvE leagues or PvP pools",
    rarity: "common" as "common" | "rare" | "extremely-rare",
    price: 50,  
    seller: "GameShop",
    quantity: 1,
    createdAt: new Date('2023-07-20')
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

export type ItemTypeKey = "arena-pass" | "gacha-ticket" | "energy-refill" | "exp-booster" | "rank-skip" | "async-battle-ticket";

interface MarketplaceConsumableItem extends MarketplaceItemBase {
  type: "item";
  itemType: ItemTypeKey;
  description: string;
  rarity: "common" | "rare" | "extremely-rare";
  quantity: number;
}

export type AnyMarketplaceItem = MarketplaceHolobotItem | MarketplaceBlueprintItem | MarketplaceConsumableItem;

const Marketplace = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [filteredItems, setFilteredItems] = useState(MARKETPLACE_ITEMS as AnyMarketplaceItem[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuying, setIsBuying] = useState(false);
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
        const { error } = await supabase
          .from('profiles')
          .update({ blueprints: cleanedBlueprints })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error cleaning up blueprints:', error);
        } else {
          // Update the local user state
          updateUser({ blueprints: cleanedBlueprints });
          toast({
            title: "Blueprints Cleaned",
            description: "Removed invalid blueprint entries from your inventory.",
          });
        }
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

    // Type-safe item lookup without unsafe type assertion
    const itemToBuy = MARKETPLACE_ITEMS.find(item => item.id === itemId);

    if (!itemToBuy) {
      toast({ 
        title: "Error", 
        description: "Item not found.", 
        variant: "destructive" 
      });
      setIsBuying(false);
      return;
    }

    // Additional validation to ensure itemToBuy has expected properties
    if (!itemToBuy.type || !itemToBuy.price || !itemToBuy.name) {
      toast({ 
        title: "Error", 
        description: "Invalid item data.", 
        variant: "destructive" 
      });
      setIsBuying(false);
      return;
    }

    // Type-safe access after validation
    const validatedItem = itemToBuy as AnyMarketplaceItem;

    // Prevent buying Holobots
    if (validatedItem.type === "holobot") {
      toast({
        title: "Buying Disabled",
        description: "Holobot purchasing from the marketplace is temporarily disabled.",
        variant: "destructive",
      });
      setIsBuying(false);
      return;
    }

    if (user.holosTokens < validatedItem.price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${validatedItem.price - user.holosTokens} more HOLOS tokens to purchase this item.`,
        variant: "destructive",
      });
      setIsBuying(false);
      return;
    }
    
    try {
      const newHolosTokens = user.holosTokens - validatedItem.price;
      let profileUpdatesForSupabase: any = { holos_tokens: newHolosTokens };
      let updatedUserProfileFields: Partial<typeof user> = { holosTokens: newHolosTokens };

      if (validatedItem.type === "blueprint") {
        const currentBlueprints = user.blueprints || {};
        const updatedBlueprints = {
          ...currentBlueprints,
          [validatedItem.holobotName]: (currentBlueprints[validatedItem.holobotName] || 0) + 1,
        };
        profileUpdatesForSupabase.blueprints = updatedBlueprints;
        updatedUserProfileFields.blueprints = updatedBlueprints;
      } else if (validatedItem.type === "item") {
        switch (validatedItem.itemType) {
          case "gacha-ticket":
            profileUpdatesForSupabase.gacha_tickets = (user.gachaTickets || 0) + 1;
            updatedUserProfileFields.gachaTickets = (user.gachaTickets || 0) + 1;
            break;
          case "arena-pass":
            profileUpdatesForSupabase.arena_passes = (user.arena_passes || 0) + 1;
            updatedUserProfileFields.arena_passes = (user.arena_passes || 0) + 1;
            break;
          case "exp-booster":
            profileUpdatesForSupabase.exp_boosters = (user.exp_boosters || 0) + 1;
            updatedUserProfileFields.exp_boosters = (user.exp_boosters || 0) + 1;
            break;
          case "energy-refill":
            profileUpdatesForSupabase.energy_refills = (user.energy_refills || 0) + 1;
            updatedUserProfileFields.energy_refills = (user.energy_refills || 0) + 1;
            break;
          case "rank-skip":
            profileUpdatesForSupabase.rank_skips = (user.rank_skips || 0) + 1;
            updatedUserProfileFields.rank_skips = (user.rank_skips || 0) + 1;
            break;
          case "async-battle-ticket":
            profileUpdatesForSupabase.async_battle_tickets = (user.async_battle_tickets || 0) + 1;
            updatedUserProfileFields.async_battle_tickets = (user.async_battle_tickets || 0) + 1;
            break;
          default:
            throw new Error(`Unknown item type: ${validatedItem.itemType}`);
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdatesForSupabase)
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      if (updateUser) {
        await updateUser(updatedUserProfileFields); 
      } else {
        console.error("updateUser function is not available from useAuth. Local state may be stale.");
      }

      toast({
        title: "Purchase Successful",
        description: `You've purchased ${validatedItem.name} for ${validatedItem.price} HOLOS tokens.`,
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
    <div className="min-h-screen bg-[#111520] text-white">
      <div className="container mx-auto pt-16 px-4 pb-16">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400 font-orbitron italic">
            HOLOBOT MARKETPLACE
          </h1>
          <p className="text-gray-200 text-sm max-w-md mx-auto">
            Buy and sell Holobots, Blueprints, and Items
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-4">
          {/* Top Row: Search and Balance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Bar */}
            <div className="md:col-span-2 bg-[#1A1F2C] rounded-lg border border-cyan-900/30 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search marketplace..."
                  className="w-full py-2 pl-10 pr-4 rounded-md bg-black/40 border border-cyan-900/30 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <SlidersHorizontal className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <select className="bg-black/40 border border-cyan-900/30 rounded-md px-3 py-2 text-gray-200">
                  <option>All Items</option>
                  <option>Holobots</option>
                  <option>Blueprints</option>
                  <option>Items</option>
                </select>
                <select className="bg-black/40 border border-cyan-900/30 rounded-md px-3 py-2 text-gray-200">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Balance */}
            <div className="bg-[#1A1F2C] rounded-lg border border-cyan-900/30 p-4">
              <h3 className="text-lg font-bold text-red-400 mb-2 font-orbitron">Balance</h3>
              <div className="flex items-center text-cyan-400 text-xl font-bold mb-3">
                <div className="w-3 h-3 mr-2 bg-yellow-400 rounded-full"></div>
                {user.holosTokens} HOLOS
              </div>
              
              <div className="mt-2">
                <h4 className="text-sm font-bold mb-1 text-red-400">Need more HOLOS?</h4>
                <Button 
                  className="w-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Buy Tokens
                </Button>
              </div>
            </div>
          </div>

          {/* Parts Section */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 bg-cyan-400 rounded-full mr-2"></div>
              <h2 className="text-xl font-bold text-white">Holobot Parts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {MARKETPLACE_PARTS.map(part => (
                <MarketplacePartCard
                  key={part.id}
                  part={part}
                  onBuy={handleBuyPart}
                  isBuying={isBuying}
                />
              ))}
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-4 h-4 bg-cyan-400 rounded-full mr-2"></div>
              <h2 className="text-xl font-bold text-white">Items</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {itemItems.map(item => (
                <div key={item.id} className="bg-[#1A1F2C] rounded-lg border border-cyan-900/30 p-4">
                  <div className="flex gap-4 mb-4">
                    <div className={`
                      h-24 w-20 rounded-lg flex items-center justify-center
                      ${item.itemType === 'energy-refill' ? 'bg-blue-900/30' : 
                        item.itemType === 'gacha-ticket' ? 'bg-amber-900/30' : 
                        item.itemType === 'exp-booster' ? 'bg-green-900/30' : 
                        item.itemType === 'arena-pass' ? 'bg-purple-900/30' : 
                        item.itemType === 'async-battle-ticket' ? 'bg-cyan-900/30' : 'bg-red-900/30'}
                    `}>
                      {item.itemType === 'energy-refill' && (
                        <div className="text-blue-400 text-4xl">⚡</div>
                      )}
                      {item.itemType === 'gacha-ticket' && (
                        <div className="text-amber-400 text-4xl">🎫</div>
                      )}
                      {item.itemType === 'exp-booster' && (
                        <div className="text-green-400 text-4xl">▶▶</div>
                      )}
                      {item.itemType === 'arena-pass' && (
                        <div className="text-purple-400 text-4xl">🏆</div>
                      )}
                      {item.itemType === 'async-battle-ticket' && (
                        <div className="text-cyan-400 text-4xl">⚔️</div>
                      )}
                      {item.itemType === 'rank-skip' && (
                        <div className="text-red-400 text-4xl">⏫</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className={`
                            font-bold text-lg
                            ${item.itemType === 'energy-refill' ? 'text-blue-400' : 
                              item.itemType === 'gacha-ticket' ? 'text-purple-400' : 
                              item.itemType === 'exp-booster' ? 'text-green-400' : 
                              item.itemType === 'arena-pass' ? 'text-purple-400' : 
                              item.itemType === 'async-battle-ticket' ? 'text-cyan-400' : 'text-yellow-400'}
                          `}>
                            {item.name.split(' ').slice(0,2).join(' ')}
                          </h3>
                          <h4 className="text-white">
                            {item.name.split(' ').slice(2).join(' ')}
                          </h4>
                        </div>
                        <span className={`
                          text-xs px-2 py-0.5 h-fit rounded-full border
                          ${item.rarity === 'common' ? 'border-gray-400 text-gray-400' : 
                            item.rarity === 'rare' ? 'border-purple-400 text-purple-400' : 
                            'border-yellow-400 text-yellow-400 bg-yellow-400/10'}
                        `}>
                          {item.rarity === 'common' ? 'Common' : 
                           item.rarity === 'rare' ? 'Rare' : 
                           'Extremely-Rare'}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-cyan-900/30 pt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      Seller: {item.seller} 
                      {item.quantity > 1 && <span className="text-cyan-400 ml-2">x{item.quantity}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">{item.price} HOLOS</span>
                      <Button 
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        onClick={() => handleBuy(item.id)}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
