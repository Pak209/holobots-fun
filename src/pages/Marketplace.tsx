import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MarketplaceHolobotCard } from "@/components/marketplace/MarketplaceHolobotCard";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
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

const Marketplace = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [activeNavItem, setActiveNavItem] = useState<string>("browse");
  const [filteredItems, setFilteredItems] = useState(MARKETPLACE_ITEMS as AnyMarketplaceItem[]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  
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
      let profileUpdatesForSupabase: any = { holos_tokens: newHolosTokens };
      let updatedUserProfileFields: Partial<typeof user> = { holosTokens: newHolosTokens };

      if (itemToBuy.type === "blueprint") {
        const currentBlueprints = user.blueprints || {};
        const updatedBlueprints = {
          ...currentBlueprints,
          [itemToBuy.holobotName]: (currentBlueprints[itemToBuy.holobotName] || 0) + 1,
        };
        profileUpdatesForSupabase.blueprints = updatedBlueprints;
        updatedUserProfileFields.blueprints = updatedBlueprints;
      } else if (itemToBuy.type === "item") {
        switch (itemToBuy.itemType) {
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
          default:
            throw new Error(`Unknown item type: ${itemToBuy.itemType}`);
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

        {/* Tab Navigation */}
        <div className="flex border border-cyan-900/30 rounded-md overflow-hidden mb-6">
          <button 
            className={`flex-1 py-3 px-4 flex items-center justify-center ${activeNavItem === 'browse' 
              ? 'bg-cyan-500/20 text-white' 
              : 'bg-[#0D111A] text-gray-400'}`}
            onClick={() => setActiveNavItem('browse')}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            <span className="font-medium">Browse Marketplace</span>
          </button>
          <button 
            className={`flex-1 py-3 px-4 flex items-center justify-center ${activeNavItem === 'inventory' 
              ? 'bg-cyan-500/20 text-white' 
              : 'bg-[#0D111A] text-gray-400'}`}
            onClick={() => setActiveNavItem('inventory')}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            <span className="font-medium">My Inventory</span>
          </button>
        </div>

        {activeNavItem === 'browse' && (
          <>
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

              {/* Holobots Section - Removed as per user request
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full mr-2"></div>
                  <h2 className="text-xl font-bold text-white">Holobots</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {holobotItems.map(item => (
                    <div key={item.id} className="bg-[#1A1F2C] rounded-lg border border-cyan-900/30 overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-cyan-400 text-lg font-bold">{item.name}</span>
                            <span className="ml-2 px-2 py-0.5 bg-cyan-500 rounded-full text-xs text-white">
                              LV{item.level}
                            </span>
                          </div>
                          <div className="px-2 py-0.5 rounded text-xs uppercase">
                            {item.level > 10 ? "CHAMPION" : "STARTER"}
                          </div>
                        </div>
                        
                        <div className="flex space-x-4">
                          <div className="space-y-1">
                            <div className="text-xs">HP: {HOLOBOT_STATS[item.name.toLowerCase()].maxHealth}</div>
                            <div className="text-xs">Attack: {HOLOBOT_STATS[item.name.toLowerCase()].attack}</div>
                            <div className="text-xs">Defense: {HOLOBOT_STATS[item.name.toLowerCase()].defense}</div>
                            <div className="text-xs">Speed: {HOLOBOT_STATS[item.name.toLowerCase()].speed}</div>
                            <div className="text-xs text-cyan-400">
                              Special: {HOLOBOT_STATS[item.name.toLowerCase()].specialMove || "None"}
                            </div>
                          </div>
                          
                          <div className="bg-black/40 rounded overflow-hidden w-24 h-24 flex items-center justify-center">
                            <img 
                              src={HOLOBOT_IMAGE_MAPPING[item.name.toUpperCase()]} 
                              alt={item.name}
                              className="w-20 h-20 object-contain"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/20 p-2 flex justify-between items-center">
                        <div className="text-sm">
                          Seller: {item.seller}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold">{item.price} HOLOS</span>
                          <Button 
                            className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center"
                            onClick={() => handleBuy(item.id)}
                          >
                            <span className="mr-1">⭘</span> Buy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              */}

              {/* Blueprints Section - Removed as per user request
              <div>
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 bg-cyan-400 rounded-full mr-2"></div>
                  <h2 className="text-xl font-bold text-white">Blueprints</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {blueprintItems.map(item => (
                    <div key={item.id}>
                      <div className={`
                        ${item.holobotName === 'KUMA' ? 'bg-green-800' : 
                         item.holobotName === 'ACE' ? 'bg-blue-800' : 
                         item.holobotName === 'WOLF' ? 'bg-purple-800' : 
                         item.holobotName === 'TORA' ? 'bg-green-800' : 'bg-blue-800'}
                        rounded-lg overflow-hidden h-48 border-2 border-cyan-500/30 relative
                      `}>
                        <div className="absolute top-2 right-2 z-10 bg-cyan-500 rounded px-2 py-0.5 text-xs text-white">
                          FOR SALE
                        </div>
                        <div className="flex items-center justify-center h-full p-6">
                          <img 
                            src={HOLOBOT_IMAGE_MAPPING[item.holobotName]}
                            alt={item.holobotName}
                            className="w-32 h-32 object-contain opacity-50"
                          />
                        </div>
                        <div className="absolute bottom-0 w-full bg-black/50 p-2">
                          <div className="text-white font-bold text-lg">
                            {item.holobotName} BLUEPRINT
                          </div>
                          <div className="bg-black/50 inline-block px-2 py-0.5 rounded text-xs text-white mt-1">
                            Tier {item.tier}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-yellow-400 font-bold">{item.price} HOLOS</span>
                        <Button 
                          className="bg-cyan-500 hover:bg-cyan-600 text-white flex items-center"
                          onClick={() => handleBuy(item.id)}
                        >
                          <span className="mr-1">⭘</span> Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              */}

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
                            item.itemType === 'arena-pass' ? 'bg-purple-900/30' : 'bg-red-900/30'}
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
                                  item.itemType === 'arena-pass' ? 'text-purple-400' : 'text-yellow-400'}
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
          </>
        )}

        {activeNavItem === 'inventory' && user && (
          <div className="bg-[#1A1F2C] rounded-lg border border-cyan-900/30 p-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 font-orbitron">My Inventory</h2>
            
            {/* Holobots */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-3">My Holobots ({user.holobots?.length || 0})</h3>
              {user.holobots && user.holobots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.holobots.map((holobot, index) => (
                    <div key={`${holobot.name}-${index}`} className="bg-[#0D111A] p-4 rounded-md border border-cyan-700/50">
                      <p className="text-lg font-bold text-cyan-300">{holobot.name}</p>
                      <p className="text-sm text-gray-300">Level: {holobot.level}</p>
                      <p className="text-sm text-gray-300">Rank: {holobot.rank}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You don't own any Holobots yet.</p>
              )}
            </div>

            {/* Blueprints */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-3">My Blueprints</h3>
              {user.blueprints && Object.keys(user.blueprints).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(user.blueprints).map(([holobotName, count]) => {
                    // Skip entries with 0 count
                    if (count <= 0) return null;
                    
                    // Convert common name variations to a standardized format
                    // This helps avoid duplicate displays of the same blueprint with different casings
                    const normalizedName = holobotName.toLowerCase();
                    
                    // Check if we've already processed this holobot type (case insensitive)
                    const isDuplicate = Object.entries(user.blueprints || {})
                      .some(([name, c]) => 
                        name.toLowerCase() === normalizedName && 
                        name !== holobotName && 
                        c > 0
                      );
                      
                    // Skip if this is a duplicate entry (different case but same holobot)
                    if (isDuplicate) return null;
                    
                    // Combine counts for same blueprint with different casings
                    const totalCount = Object.entries(user.blueprints || {})
                      .reduce((sum, [name, c]) => 
                        name.toLowerCase() === normalizedName ? sum + c : sum, 
                        0
                      );
                      
                    // Format the display name to be title case (first letter capitalized)
                    const displayName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
                    
                    return (
                      <div key={normalizedName} className="bg-[#0D111A] p-3 rounded-md border border-cyan-700/50">
                        <p className="text-md font-semibold text-cyan-300">{displayName} Blueprint</p>
                        <p className="text-sm text-gray-300">Quantity: {totalCount}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400">You don't have any blueprints.</p>
              )}
            </div>

            {/* Consumable Items */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-3">My Items</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.gachaTickets > 0 && (
                  <div className="bg-[#0D111A] p-3 rounded-md border border-cyan-700/50">
                    <p className="text-md font-semibold text-purple-400">Gacha Tickets</p>
                    <p className="text-sm text-gray-300">Quantity: {user.gachaTickets}</p>
                  </div>
                )}
                {user.arena_passes > 0 && (
                  <div className="bg-[#0D111A] p-3 rounded-md border border-cyan-700/50">
                    <p className="text-md font-semibold text-purple-400">Arena Passes</p>
                    <p className="text-sm text-gray-300">Quantity: {user.arena_passes}</p>
                  </div>
                )}
                {user.exp_boosters > 0 && (
                  <div className="bg-[#0D111A] p-3 rounded-md border border-cyan-700/50">
                    <p className="text-md font-semibold text-green-400">EXP Boosters</p>
                    <p className="text-sm text-gray-300">Quantity: {user.exp_boosters}</p>
                  </div>
                )}
                {user.energy_refills > 0 && (
                  <div className="bg-[#0D111A] p-3 rounded-md border border-cyan-700/50">
                    <p className="text-md font-semibold text-blue-400">Energy Refills</p>
                    <p className="text-sm text-gray-300">Quantity: {user.energy_refills}</p>
                  </div>
                )}
                {user.rank_skips > 0 && (
                  <div className="bg-[#0D111A] p-3 rounded-md border border-cyan-700/50">
                    <p className="text-md font-semibold text-yellow-400">Rank Skips</p>
                    <p className="text-sm text-gray-300">Quantity: {user.rank_skips}</p>
                  </div>
                )}
              </div>
              {(user.gachaTickets === 0 && user.arena_passes === 0 && user.exp_boosters === 0 && user.energy_refills === 0 && user.rank_skips === 0) && (
                <p className="text-gray-400">You don't have any consumable items.</p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Marketplace;
