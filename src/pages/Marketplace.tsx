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
    seller: "ItemShop",
    quantity: 3,
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
    seller: "BoostMaster",
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
    seller: "LegendaryTrader",
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
    seller: "BattleMaster",
    quantity: 2,
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
    seller: "GachaDealer",
    quantity: 3,
    createdAt: new Date('2023-07-16')
  }
];

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeNavItem, setActiveNavItem] = useState<string>("browse");
  const [filteredItems, setFilteredItems] = useState(MARKETPLACE_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter items by type
  const holobotItems = MARKETPLACE_ITEMS.filter(item => item.type === "holobot");
  const blueprintItems = MARKETPLACE_ITEMS.filter(item => item.type === "blueprint");
  const itemItems = MARKETPLACE_ITEMS.filter(item => item.type === "item");
  
  const handleBuy = (itemId: string, itemName: string, price: number) => {
    // Check if user has enough tokens
    if (user.holosTokens < price) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${price - user.holosTokens} more HOLOS tokens to purchase this item.`,
        variant: "destructive"
      });
      return;
    }
    
    // Process purchase
    toast({
      title: "Purchase Successful",
      description: `You've purchased ${itemName} for ${price} HOLOS tokens.`
    });
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

          {/* Holobots Section */}
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
                        onClick={() => handleBuy(item.id, `${item.name} (Lv.${item.level})`, item.price)}
                      >
                        <span className="mr-1">⭘</span> Buy
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blueprints Section */}
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
                      onClick={() => handleBuy(item.id, `${item.holobotName} Blueprint (Tier ${item.tier})`, item.price)}
                    >
                      <span className="mr-1">⭘</span> Buy
                    </Button>
                  </div>
                </div>
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
                        onClick={() => handleBuy(item.id, item.name, item.price)}
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
